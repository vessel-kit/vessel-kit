import * as t from 'io-ts';
import { DoctypeHandler } from '../document/doctype';
import { SimpleCodec, CidStringCodec, CeramicDocumentId } from '@potter/codec';
import { VesselRulesetAlpha } from './vessel-ruleset-alpha';
import { DocumentState } from '..';
import { InvalidDocumentUpdateLinkError } from './invalid-document-update-link.error';
import jsonPatch from 'fast-json-patch';
import { RecordWrap } from '@potter/codec';
import { AnchoringStatus } from '@potter/anchoring';
import CID from 'cids';

const DOCTYPE = 'vessel/document/1.0.0';

const json = t.type({
  doctype: t.literal(DOCTYPE),
  governance: t.string.pipe(CidStringCodec),
  content: t.UnknownRecord,
});

type Freight = t.TypeOf<typeof json>;

class Handler extends DoctypeHandler<Freight> {
  readonly name = DOCTYPE;
  readonly json = new SimpleCodec(json);

  async makeGenesis(record: any): Promise<any> {
    await this.canApply({}, record, this.json.decode(record).governance);
    return record;
  }

  async canApply(current: any, next: any, rulesetCID?: CID) {
    const effectiveRulesetCid = rulesetCID || this.json.decode(current).governance;
    const rulesetJSON = await this.context.retrieve(effectiveRulesetCid);
    const ruleset = VesselRulesetAlpha.json.decode(rulesetJSON);
    const canApply = ruleset.canApply(current, next);
    if (!canApply) {
      throw new Error(`Can not apply`);
    }
  }

  async applyUpdate(updateRecord: RecordWrap, state: DocumentState): Promise<DocumentState> {
    if (!(updateRecord.load.id && updateRecord.load.id.equals(state.log.first))) {
      throw new InvalidDocumentUpdateLinkError(`Expected ${state.log.first} id while got ${updateRecord.load.id}`);
    }
    await this.context.assertSignature(updateRecord.load);
    const current = state.current || state.freight;
    const next = jsonPatch.applyPatch(state.current || state.freight, updateRecord.load.patch, false, false)
      .newDocument;
    await this.canApply(current, next);
    return {
      ...state,
      current: next,
      log: state.log.concat(updateRecord.cid),
      anchor: {
        status: AnchoringStatus.NOT_REQUESTED,
      },
    };
  }
}

export const VesselDocumentAlpha = new Handler();
