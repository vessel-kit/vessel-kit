import * as t from "io-ts";
import { DoctypeHandler } from "../document/doctype";
import { decodeThrow, DocId, RecordWrap } from "@vessel-kit/codec";
import "./ses";
import { IContext } from "../context";

import * as fs from "fs";
import terser from "terser";
import * as ts from "typescript";
import { AnchoringStatus, AnchorProof } from "@vessel-kit/anchoring";
import { Ordering } from "../document/ordering";
import { AnchorState } from "../document/anchor-state";
import { isRight } from "fp-ts/lib/Either";
import { IRuleset } from "../ruleset.interface";
import { VesselDocumentState } from "./vessel-document-alpha-doctype";

const DOCTYPE = "vessel/ruleset/1.0.0";

const json = t.type({
  doctype: t.literal(DOCTYPE),
  content: t.type({
    type: t.literal(`application/javascript`),
    main: t.string,
  }),
});

export class Freight<State, Shape> implements t.TypeOf<typeof json> {
  doctype: typeof DOCTYPE = DOCTYPE;
  content: {
    type: "application/javascript";
    main: string;
  };
  #ruleset: IRuleset<State, Shape>;

  constructor(params: t.TypeOf<typeof json>, readonly context: IContext) {
    this.content = params.content;
    const compartment = new Compartment({
      exports: {},
      console: console,
      require: (moduleName: string) => {
        // TODO Remove when authoring properly bundles code
        if (moduleName === "fast-json-patch") {
          return require("fast-json-patch");
        } else {
          throw new Error(`Can not require ${moduleName}: prohibited`);
        }
      },
    });
    const Ruleset = compartment.evaluate(this.content.main);
    this.#ruleset = new Ruleset(this.context);
  }

  async knead(genesisRecord: unknown) {
    return this.#ruleset.knead(genesisRecord);
  }

  async canApply(
    docId: DocId,
    state: VesselDocumentState<State>,
    recordWrap: RecordWrap
  ): Promise<VesselDocumentState<State>> {
    return this.#ruleset.canApply(docId, state, recordWrap);
  }

  // TODO Special anchoring
  async applyAnchor(proof: AnchorProof, state: State): Promise<State> {
    return this.#ruleset.applyAnchor(proof, state);
  }

  async canonical(state: VesselDocumentState<State>) {
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
    signature: t.string,
  },
  "RulesetShape"
);

const State = t.type(
  {
    current: Shape,
    anchor: AnchorState,
  },
  "RulesetState"
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
    const source = await fs.promises
      .readFile(filename)
      .then((s) => s.toString());
    const outputText = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2017,
      },
    }).outputText;
    const minified = await terser.minify(outputText, { mangle: false });
    const main = minified.code;
    return {
      doctype: DOCTYPE,
      content: {
        type: "application/javascript" as "application/javascript",
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
      throw new Error("Invalid Vessel Ruleset Shape");
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

  async canonical(state: State): Promise<Shape> {
    return state.current;
  }

  async apply(): Promise<State> {
    throw new Error(`VesselRulesetAlpha.apply: not implemented`);
  }
}

export const VesselRulesetAlphaDoctype = new VesselRulesetAlphaHandler();
