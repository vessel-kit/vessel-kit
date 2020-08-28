import { DoctypeHandler } from '../document/doctype';
import { VesselRulesetAlphaDoctype } from './vessel-ruleset-alpha-doctype';
import { InvalidDocumentUpdateLinkError } from './invalid-document-update-link.error';
import jsonPatch from 'fast-json-patch';
import { RecordWrap } from '@potter/codec';
import { AnchoringStatus, AnchorProof } from '@potter/anchoring';
import produce from 'immer';
import { CeramicDocumentId } from '@potter/codec';
import { Ordering } from '../document/ordering';
import { AnchorState } from '../document/anchor-state';
import { IDocument } from '..';
import { UpdateRecordWaiting } from '../util/update-record.codec';

const DOCTYPE = 'vessel/document/1.0.0';

export type TwoPartyShape = {
  payload: {
    num: number;
  };
  partyA?: Signature;
  partyB?: Signature;
  stage: 'draft' | 'agreement';
};

type Signature = {
  iss: string;
  header: { typ: 'JWT'; alg: string };
  signature: string;
};

export type VesselDocumentShape<A> = {
  doctype: string;
  ruleset: string;
  content: A;
};

export type TwoPartyState = {
  current: TwoPartyShape | null;
  freight: TwoPartyShape;
  anchor: AnchorState;
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

class Handler extends DoctypeHandler<VesselDocumentState<TwoPartyState>, VesselDocumentShape<TwoPartyShape>> {
  readonly name = DOCTYPE;

  async knead(genesisRecord: unknown): Promise<VesselDocumentState<TwoPartyState>> {
    if (isShape<TwoPartyShape>(genesisRecord)) {
      return {
        doctype: genesisRecord.doctype,
        ruleset: genesisRecord.ruleset,
        data: {
          current: null,
          freight: {
            ...genesisRecord.content,
            stage: 'draft',
          },
          anchor: {
            status: AnchoringStatus.NOT_REQUESTED,
          },
        },
      };
    } else {
      console.error('Invalid shape for VesselDocumentAlpha', genesisRecord);
      throw new Error(`Invalid shape for VesselDocumentAlpha`);
    }
  }

  async canApply(
    state: VesselDocumentState<TwoPartyState>,
    next: TwoPartyShape,
    rulesetAddress?: CeramicDocumentId,
  ): Promise<VesselDocumentState<TwoPartyState>> {
    const effectiveRulesetCid = rulesetAddress || CeramicDocumentId.fromString(state.ruleset);
    const rulesetJSON = await this.context.retrieve(effectiveRulesetCid.cid);
    const ruleset = VesselRulesetAlphaDoctype.withContext(this.context).json.decode(rulesetJSON);
    const nextState = await ruleset.canApply<VesselDocumentState<TwoPartyState>>(state, next);
    if (!nextState) {
      console.error('Can not apply', state, next);
      throw new Error(`Can not apply`);
    }
    return nextState;
  }

  async applyUpdate(
    updateRecord: RecordWrap,
    state: VesselDocumentState<TwoPartyState>,
    docId: CeramicDocumentId,
  ): Promise<VesselDocumentState<TwoPartyState>> {
    if (!(updateRecord.load.id && updateRecord.load.id.equals(docId.cid))) {
      throw new InvalidDocumentUpdateLinkError(`Expected ${docId.cid} id while got ${updateRecord.load.id}`);
    }
    await this.context.assertSignature(updateRecord.load);
    const next = jsonPatch.applyPatch(state.data.current || state.data.freight, updateRecord.load.patch, false, false)
      .newDocument;
    await this.canApply(state, next);
    state.data.current = next;
    state.data.anchor = {
      status: AnchoringStatus.NOT_REQUESTED,
    };
    return state;
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

  async applyAnchor(
    anchorRecord: RecordWrap,
    proof: AnchorProof,
    state: VesselDocumentState<TwoPartyState>,
  ): Promise<VesselDocumentState<TwoPartyState>> {
    return produce(state, async (next) => {
      if (next.data.current) {
        next.data.freight = next.data.current;
        next.data.current = null;
      }
      next.data.anchor = {
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

  async canonical(state: VesselDocumentState<TwoPartyState>): Promise<VesselDocumentShape<TwoPartyShape>> {
    const effectiveRulesetCid = CeramicDocumentId.fromString(state.ruleset);
    const rulesetJSON = await this.context.retrieve(effectiveRulesetCid.cid);
    const ruleset = VesselRulesetAlphaDoctype.withContext(this.context).json.decode(rulesetJSON);
    return ruleset.canonical(state);
  }

  async apply(
    recordWrap,
    state: VesselDocumentState<TwoPartyState>,
    docId,
  ): Promise<VesselDocumentState<TwoPartyState>> {
    const record = recordWrap.load;
    if (record.prev) {
      if (record.proof) {
        const proof = await this.context.verifyAnchor(recordWrap);
        return produce(state, async (next) => {
          if (next.data.current) {
            next.data.freight = next.data.current;
            next.data.current = null;
          }
          next.data.anchor = {
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
