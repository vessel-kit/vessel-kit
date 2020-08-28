import { DoctypeHandler } from '../document/doctype';
import { VesselRulesetAlphaDoctype } from './vessel-ruleset-alpha-doctype';
import jsonPatch from 'fast-json-patch';
import { AnchoringStatus, AnchorProof } from '@potter/anchoring';
import produce from 'immer';
import { CeramicDocumentId } from '@potter/codec';
import { Ordering } from '../document/ordering';
import { IDocument } from '..';
import { UpdateRecordWaiting } from '../util/update-record.codec';

const DOCTYPE = 'vessel/document/1.0.0';

export type VesselDocumentShape<A> = {
  doctype: string;
  ruleset: string;
  content: A;
};

export type VesselDocumentState<A> = {
  doctype: string;
  ruleset: string;
  data: A;
};

function isShape<A>(input: unknown): input is VesselDocumentShape<A> {
  // TODO UNKNOWN
  return typeof input === 'object' && 'doctype' in input && (input as any).doctype == DOCTYPE;
}

function isVesselDocument<State, Shape>(
  document: IDocument<unknown, unknown>,
): document is IDocument<VesselDocumentState<State>, VesselDocumentShape<Shape>> {
  // TODO UNKNOWN
  return document.state.doctype === DOCTYPE;
}

export class VesselDocument<State, Shape> {
  readonly #document: IDocument<VesselDocumentState<State>, VesselDocumentShape<Shape>>;
  #canonical: VesselDocumentShape<Shape>;

  constructor(
    document: IDocument<VesselDocumentState<State>, VesselDocumentShape<Shape>>,
    canonical: VesselDocumentShape<Shape>,
  ) {
    this.#document = document;
    this.#canonical = canonical;
    this.#document.state$.subscribe(async () => {
      this.#canonical = await this.#document.canonical();
    });
  }

  static async fromDocument<State, Shape>(document: IDocument<unknown, unknown>) {
    if (isVesselDocument<State, Shape>(document)) {
      const canonical = await document.canonical();
      return new VesselDocument(document, canonical);
    } else {
      throw new Error(`Invalid doctype: expected tile, got ${document.state.doctype}`);
    }
  }

  get document(): IDocument<VesselDocumentState<State>, VesselDocumentShape<Shape>> {
    return this.#document;
  }

  async change(mutation: (t: Shape) => Promise<Shape> | Shape): Promise<void> {
    const shape = this.#canonical.content;
    const nextShape = await produce(shape, mutation);
    const nextCanonical = {
      ...this.#canonical,
      content: nextShape,
    };
    const patch = jsonPatch.compare(this.#canonical, nextCanonical);
    const payloadToSign = UpdateRecordWaiting.encode({
      patch: patch,
      prev: this.#document.log.last,
      id: this.#document.id,
    });
    const signed = await this.#document.context.sign(payloadToSign);
    await this.#document.update(signed);
  }
}

class Handler<State, Shape> extends DoctypeHandler<VesselDocumentState<State>, VesselDocumentShape<Shape>> {
  readonly name = DOCTYPE;

  async knead(genesisRecord: unknown): Promise<VesselDocumentState<State>> {
    if (isShape<unknown>(genesisRecord)) {
      const effectiveRulesetCid = CeramicDocumentId.fromString(genesisRecord.ruleset);
      const rulesetJSON = await this.context.retrieve(effectiveRulesetCid.cid);
      const ruleset = VesselRulesetAlphaDoctype.withContext(this.context).json.decode(rulesetJSON);
      return ruleset.knead(genesisRecord);
    } else {
      console.error('Invalid shape for VesselDocumentAlpha', genesisRecord);
      throw new Error(`Invalid shape for VesselDocumentAlpha`);
    }
  }

  async canApply(
    state: VesselDocumentState<State>,
    next: Shape,
    rulesetAddress?: CeramicDocumentId,
  ): Promise<VesselDocumentState<State>> {
    const effectiveRulesetCid = rulesetAddress || CeramicDocumentId.fromString(state.ruleset);
    const rulesetJSON = await this.context.retrieve(effectiveRulesetCid.cid);
    const ruleset = VesselRulesetAlphaDoctype.withContext(this.context).json.decode(rulesetJSON);
    const nextState = await ruleset.canApply<VesselDocumentState<State>>(state, next);
    if (!nextState) {
      console.error('Can not apply', state, next);
      throw new Error(`Can not apply`);
    }
    return nextState;
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

  async canonical(state: VesselDocumentState<State>): Promise<VesselDocumentShape<Shape>> {
    const effectiveRulesetCid = CeramicDocumentId.fromString(state.ruleset);
    const rulesetJSON = await this.context.retrieve(effectiveRulesetCid.cid);
    const ruleset = VesselRulesetAlphaDoctype.withContext(this.context).json.decode(rulesetJSON);
    return ruleset.canonical(state);
  }

  async applyAnchor(proof: AnchorProof, state: VesselDocumentState<State>): Promise<State> {
    const effectiveRulesetCid = CeramicDocumentId.fromString(state.ruleset);
    const rulesetJSON = await this.context.retrieve(effectiveRulesetCid.cid);
    const ruleset = VesselRulesetAlphaDoctype.withContext(this.context).json.decode(rulesetJSON);
    return ruleset.applyAnchor(proof, state.data);
  }

  async apply(recordWrap, state: VesselDocumentState<State>, docId): Promise<VesselDocumentState<State>> {
    const record = recordWrap.load;
    if (record.prev) {
      if (record.proof) {
        const proof = await this.context.verifyAnchor(recordWrap);
        const next = await this.applyAnchor(proof, state);
        return {
          ...state,
          data: next,
        };
      } else {
        await this.context.assertSignature(record);
        const canonical = await this.canonical(state);
        const next = jsonPatch.applyPatch(canonical, record.patch, false, false).newDocument;
        return this.canApply(state, next.content);
      }
    } else {
      throw new Error(`Can not apply genesis`);
    }
  }
}

export const VesselDocumentAlphaDoctype = new Handler();
