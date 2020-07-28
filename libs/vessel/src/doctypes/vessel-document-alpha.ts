import * as t from 'io-ts';
import { DoctypeHandler, Ordering } from '../document/doctype';
import { CidStringCodec } from '@potter/codec';
import { VesselRulesetAlpha } from './vessel-ruleset-alpha';
import { InvalidDocumentUpdateLinkError } from './invalid-document-update-link.error';
import jsonPatch from 'fast-json-patch';
import { RecordWrap } from '@potter/codec';
import { AnchoringStatus, AnchorProof } from '@potter/anchoring';
import CID from 'cids';
import produce from 'immer';
import { CeramicDocumentId, decodeThrow } from '@potter/codec';

const DOCTYPE = 'vessel/document/1.0.0';

const json = t.type({
  doctype: t.literal(DOCTYPE),
  ruleset: t.string.pipe(CidStringCodec),
  content: t.UnknownRecord,
});

type State = any
type Shape = any

class Handler extends DoctypeHandler<State, Shape> {
  readonly name = DOCTYPE;

  async canApply(current: any, next: any, rulesetCID?: CID) {
    const effectiveRulesetCid = rulesetCID || decodeThrow(json, current).ruleset;
    const rulesetJSON = await this.context.retrieve(effectiveRulesetCid);
    const ruleset = VesselRulesetAlpha.json.decode(rulesetJSON);
    const canApply = ruleset.canApply(current, next);
    if (!canApply) {
      console.error('Can not apply', current, next);
      throw new Error(`Can not apply`);
    }
  }

  async applyUpdate(updateRecord: RecordWrap, state: any, docId: CeramicDocumentId): Promise<any> {
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

  knead(genesisRecord: unknown): Promise<any> {
    // From make genesis
    // await this.canApply({}, record, this.json.decode(record).ruleset);
    //     return record;
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

  async canonical(state: any): Promise<any> {
    return state.current | state.freight;
  }
}

export const VesselDocumentAlpha = new Handler();
