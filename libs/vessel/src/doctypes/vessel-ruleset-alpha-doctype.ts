import * as t from 'io-ts';
import { DoctypeHandler } from '../document/doctype';
import { decodeThrow, RecordWrap, validateThrow } from '@potter/codec';
import './ses';
import { IContext } from '../context';

import * as fs from 'fs';
import terser from 'terser';
import * as ts from 'typescript';
import { AnchoringStatus, AnchorProof } from '@potter/anchoring';
import produce from 'immer';
import { Ordering } from '../document/ordering';
import { AnchorState } from '../document/anchor-state';
import { isRight } from 'fp-ts/lib/Either';

const DOCTYPE = 'vessel/ruleset/1.0.0';

const json = t.type({
  doctype: t.literal(DOCTYPE),
  content: t.type({
    type: t.literal(`application/javascript`),
    main: t.string,
  }),
});

class Freight implements t.TypeOf<typeof json> {
  doctype: typeof DOCTYPE = DOCTYPE;
  content: {
    type: 'application/javascript';
    main: string;
  };
  #ruleset: any;

  constructor(params: t.TypeOf<typeof json>, readonly context: IContext) {
    this.content = params.content;
    const compartment = new Compartment({
      exports: {},
      console: console,
    });
    const Ruleset = compartment.evaluate(this.content.main);
    this.#ruleset = new Ruleset(this.context);
  }

  async knead(genesisRecord: unknown) {
    return this.#ruleset.knead(genesisRecord);
  }

  // FIXME Any
  async canApply<A>(prev: any, next: any): Promise<A> {
    return this.#ruleset.canApply(prev, next);
  }

  async canonical<A>(state: A) {
    return this.#ruleset.canonical(state);
  }
}

const Shape = t.type(
  {
    doctype: t.literal(DOCTYPE),
    content: t.type({
      type: t.string,
      main: t.string,
    }),
    iss: t.string,
    header: t.type({
      typ: t.string,
      alg: t.string,
    }),
    signature: t.string,
  },
  'RulesetShape',
);

const State = t.type(
  {
    current: Shape,
    anchor: AnchorState,
  },
  'RulesetState',
);

type State = t.TypeOf<typeof State>;
type Shape = t.TypeOf<typeof Shape>;

function isShape(record: unknown): record is Shape {
  return isRight(Shape.validate(record, []));
}

class VesselRulesetAlphaHandler extends DoctypeHandler<State, Shape> {
  readonly name = DOCTYPE;
  readonly json = {
    // assertValid: jsonCodec.assertValid,
    encode: json.encode,
    decode: (i: unknown) => {
      return new Freight(decodeThrow(json, i), this.context);
    },
  };

  async genesisFromRulesetFile(filename: string) {
    const source = await fs.promises.readFile(filename).then((s) => s.toString());
    const outputText = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
    }).outputText;
    const main = terser.minify(outputText, { mangle: false }).code;
    return {
      doctype: DOCTYPE,
      content: {
        type: 'application/javascript' as 'application/javascript',
        main: main,
      },
    };
  }

  async knead(genesisRecord: unknown): Promise<State> {
    if (isShape(genesisRecord)) {
      return {
        current: genesisRecord,
        anchor: {
          status: AnchoringStatus.NOT_REQUESTED,
        },
      };
    } else {
      throw new Error('Invalid Vessel Ruleset Shape');
    }
  }

  async order(a: any, b: any): Promise<Ordering> {
    if (
      a.anchor.status === AnchoringStatus.ANCHORED &&
      b.anchor.status === AnchoringStatus.ANCHORED &&
      a.anchor.proof.timestamp < b.anchor.proof.timestamp
    ) {
      return Ordering.LT;
    } else {
      return Ordering.GT;
    }
  }

  async applyAnchor(anchorRecord: RecordWrap, proof: AnchorProof, state: any): Promise<any> {
    return produce(state, async (next) => {
      if (next.current) {
        next.freight = next.current;
        next.current = null;
      }
      next.anchor = {
        status: AnchoringStatus.ANCHORED as AnchoringStatus.ANCHORED,
        proof: {
          chainId: proof.chainId.toString(),
          blockNumber: proof.blockNumber,
          timestamp: new Date(proof.blockTimestamp * 1000).toISOString(),
          txHash: proof.txHash.toString(),
          root: proof.root.toString(),
        },
      };
    });
  }

  applyUpdate(updateRecord, state: any, docId): Promise<any> {
    throw new Error(`Not implemented`);
  }

  async canonical(state: State): Promise<Shape> {
    return state.current;
  }

  async apply(recordWrap, state: State, docId): Promise<State> {
    throw new Error(`VesselRulesetAlpha.apply: not implemented`);
  }
}

export const VesselRulesetAlphaDoctype = new VesselRulesetAlphaHandler();
