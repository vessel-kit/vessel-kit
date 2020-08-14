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

export type VesselDocumentShapeBase = {
  doctype: string;
  ruleset: string;
  content: {
    payload: {
      num: number;
    };
    partyA?: Signature;
    partyB?: Signature;
  };
};

type Signature = {
  iss: string;
  header: { typ: 'JWT'; alg: string };
  signature: string;
};

export type VesselDocumentShape = VesselDocumentShapeBase & Signature;
export type VesselDocumentState = {
  doctype: string;
  ruleset: string;
  current: (VesselDocumentShape & { stage: 'draft' | 'agreement' }) | null;
  freight: VesselDocumentShape & { stage: 'draft' | 'agreement' };
  anchor: AnchorState;
};

function isShape(input: unknown): input is VesselDocumentShape {
  return typeof input === 'object' && 'doctype' in input && (input as any).doctype == DOCTYPE;
}

function isVesselDocument(
  document: IDocument<unknown, unknown>,
): document is IDocument<VesselDocumentState, VesselDocumentShape> {
  return document.state.doctype === DOCTYPE;
}

export class VesselDocument {
  readonly #document: IDocument<VesselDocumentState, VesselDocumentShape>;
  #canonical: VesselDocumentShape;

  constructor(document: IDocument<VesselDocumentState, VesselDocumentShape>, canonical: VesselDocumentShape) {
    this.#document = document;
    this.#canonical = canonical;
    this.#document.state$.subscribe(async () => {
      this.#canonical = await this.#document.canonical();
    });
  }

  static async fromDocument(document: IDocument<unknown, unknown>) {
    if (isVesselDocument(document)) {
      const canonical = await document.canonical();
      return new VesselDocument(document, canonical);
    } else {
      throw new Error(`Invalid doctype: expected tile, got ${document.state.doctype}`);
    }
  }

  get document(): IDocument<VesselDocumentState, VesselDocumentShape> {
    return this.#document;
  }

  async change(
    mutation: (t: VesselDocumentShape) => Promise<VesselDocumentShape> | VesselDocumentShape,
  ): Promise<void> {
    const next = await produce(this.#canonical, mutation);
    const patch = jsonPatch.compare(this.#canonical, next);
    const payloadToSign = UpdateRecordWaiting.encode({
      patch: patch,
      prev: this.#document.log.last,
      id: this.#document.id,
    });
    const signed = await this.#document.context.sign(payloadToSign);
    await this.#document.update(signed);
  }
}

class Handler extends DoctypeHandler<VesselDocumentState, VesselDocumentShape> {
  readonly name = DOCTYPE;

  async knead(genesisRecord: unknown): Promise<VesselDocumentState> {
    if (isShape(genesisRecord)) {
      return {
        doctype: genesisRecord.doctype,
        ruleset: genesisRecord.ruleset,
        current: null,
        freight: Object.assign({}, genesisRecord, { stage: 'draft' as 'draft' }),
        anchor: {
          status: AnchoringStatus.NOT_REQUESTED,
        },
      };
    } else {
      console.error('Invalid shape for VesselDocumentAlpha', genesisRecord);
      throw new Error(`Invalid shape for VesselDocumentAlpha`);
    }
  }

  async canApply(
    state: VesselDocumentState,
    next: VesselDocumentShape,
    rulesetAddress?: CeramicDocumentId,
  ): Promise<VesselDocumentState> {
    console.log('canApply', state, next);
    const effectiveRulesetCid = rulesetAddress || CeramicDocumentId.fromString(state.ruleset);
    const rulesetJSON = await this.context.retrieve(effectiveRulesetCid.cid);
    const ruleset = VesselRulesetAlphaDoctype.withContext(this.context).json.decode(rulesetJSON);
    const nextState = await ruleset.canApply<VesselDocumentState>(state, next);
    console.log('canApply.result', nextState);
    if (!nextState) {
      console.error('Can not apply', state, next);
      throw new Error(`Can not apply`);
    }
    return nextState;
  }

  async applyUpdate(
    updateRecord: RecordWrap,
    state: VesselDocumentState,
    docId: CeramicDocumentId,
  ): Promise<VesselDocumentState> {
    if (!(updateRecord.load.id && updateRecord.load.id.equals(docId.cid))) {
      throw new InvalidDocumentUpdateLinkError(`Expected ${docId.cid} id while got ${updateRecord.load.id}`);
    }
    await this.context.assertSignature(updateRecord.load);
    const next = jsonPatch.applyPatch(state.current || state.freight, updateRecord.load.patch, false, false)
      .newDocument;
    await this.canApply(state, next);
    state.current = next;
    state.anchor = {
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
    state: VesselDocumentState,
  ): Promise<VesselDocumentState> {
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

  async canonical(state: VesselDocumentState): Promise<VesselDocumentShape> {
    return state.current || state.freight;
  }

  async apply(recordWrap, state: VesselDocumentState, docId): Promise<VesselDocumentState> {
    const record = recordWrap.load;
    if (record.prev) {
      if (record.proof) {
        const proof = await this.context.verifyAnchor(recordWrap);
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
      } else {
        await this.context.assertSignature(record);
        const next = jsonPatch.applyPatch(state.current || state.freight, record.patch, false, false).newDocument;
        return this.canApply(state, next);
      }
    } else {
      throw new Error(`Can not apply genesis`);
    }
  }
}

export const VesselDocumentAlphaDoctype = new Handler();
