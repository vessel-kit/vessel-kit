import * as t from 'io-ts';
import { DoctypeHandler } from '../document/doctype';
import { SimpleCodec, RecordWrap } from '@potter/codec';
import './ses';
import { IContext } from '../context';

import * as fs from 'fs';
import terser from 'terser';
import * as ts from 'typescript';
import { AnchoringStatus, AnchorProof } from '@potter/anchoring';
import produce from 'immer';
import { Ordering } from '../document/ordering';

const DOCTYPE = 'vessel/ruleset/1.0.0';

const json = t.type({
  doctype: t.literal(DOCTYPE),
  content: t.type({
    type: t.literal(`application/javascript`),
    main: t.string,
  }),
});

const jsonCodec = new SimpleCodec(json);

class Freight implements t.TypeOf<typeof json> {
  doctype: typeof DOCTYPE = DOCTYPE;
  content: {
    type: 'application/javascript';
    main: string;
  };

  constructor(params: t.TypeOf<typeof json>, readonly context: IContext) {
    this.content = params.content;
  }

  canApply(prev: any, next: any) {
    const compartment = new Compartment({
      exports: {},
      console: console,
    });
    console.log('comp', compartment.evaluate(this.content.main));
    console.log('exports', exports);
    const Ruleset = compartment.evaluate(this.content.main);
    console.log('Ruleset', Ruleset);
    const ruleset = new Ruleset(this.context);
    return ruleset.canApply(prev, next);
  }
}

type State = any;
type Shape = any;

class VesselRulesetAlphaHandler extends DoctypeHandler<State, Shape> {
  readonly name = DOCTYPE;
  readonly json = {
    // assertValid: jsonCodec.assertValid,
    encode: jsonCodec.encode,
    decode: (i: unknown) => {
      return new Freight(jsonCodec.decode(i), this.context);
    },
  };

  async genesisFromRulesetFile(filename: string) {
    const source = await fs.promises.readFile(filename).then((s) => s.toString());
    const outputText = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
    }).outputText;
    const main = terser.minify(outputText, { mangle: false }).code;
    return {
      content: {
        type: 'application/javascript' as 'application/javascript',
        main: main,
      },
    };
  }

  async knead(genesisRecord: unknown): Promise<any> {
    throw new Error(`Not implemented TODO`);
  }

  cone(state: any): Promise<any> {
    throw new Error(`Not implemented TODO`);
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

  async canonical(state: any): Promise<any> {
    return state.current | state.freight;
  }

  async apply(recordWrap, state: State, docId): Promise<State> {
    throw new Error(`VesselRulesetAlpha.apply: not implemented`)
  }
}

export const VesselRulesetAlpha = new VesselRulesetAlphaHandler();
