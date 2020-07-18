import { doctype } from '../document/doctype';
import { SimpleCodec } from '@potter/codec';
import * as t from 'io-ts';
import { validatePromise, CeramicDocumentId, RecordWrap } from '@potter/codec';
import { Chain, DocumentState } from '..';
import produce from 'immer';
import { AnchoringStatus, AnchorProof } from '@potter/anchoring';
import { ThreeIdentifier } from '../three-identifier';
import jsonPatch from 'fast-json-patch';
import { InvalidDocumentUpdateLinkError } from './invalid-document-update-link.error';

interface TileFreight {
  doctype: 'tile';
  owners: ThreeIdentifier[];
  content: any;
  iss: ThreeIdentifier;
  header: {
    typ: 'JWT';
    alg: string;
  };
  signature: string;
}

const TileCodec = t.type({
  doctype: t.literal('tile'),
  owners: t.array(ThreeIdentifier),
  content: t.UnknownRecord,
  iss: ThreeIdentifier,
  header: t.type({
    typ: t.literal('JWT'),
    alg: t.string,
  }),
  signature: t.string,
});

export const Tile = doctype<TileFreight>('tile', new SimpleCodec(TileCodec), {
  async makeGenesis(payload: any): Promise<t.OutputOf<typeof TileCodec>> {
    await validatePromise(TileCodec, payload);
    await this.context.assertSignature(payload);
    return payload;
  },
  async applyGenesis(documentId: CeramicDocumentId, genesis: any): Promise<DocumentState> {
    await this.makeGenesis(genesis);
    return {
      doctype: genesis.doctype,
      current: null,
      freight: genesis,
      anchor: {
        status: AnchoringStatus.NOT_REQUESTED as AnchoringStatus.NOT_REQUESTED,
      },
      log: new Chain([documentId.cid]),
    };
  },
  async applyAnchor(anchorRecord: RecordWrap, proof: AnchorProof, state: DocumentState): Promise<DocumentState> {
    return produce(state, async (next) => {
      next.log = next.log.concat(anchorRecord.cid);
      if (next.current) {
        next.freight = next.current;
        next.current = null;
      }
      next.anchor = {
        status: AnchoringStatus.ANCHORED as AnchoringStatus.ANCHORED,
        proof: {
          chainId: proof.chainId.toString(),
          blockNumber: proof.blockNumber,
          timestamp: new Date(proof.blockTimestamp * 1000),
          txHash: proof.txHash,
          root: proof.root,
        },
      };
    });
  },
  async applyUpdate(updateRecord, state: DocumentState): Promise<DocumentState> {
    if (!(updateRecord.load.id && updateRecord.load.id.equals(state.log.first))) {
      throw new InvalidDocumentUpdateLinkError(`Expected ${state.log.first} id while got ${updateRecord.load.id}`);
    }
    await this.context.assertSignature(updateRecord.load);
    const next = jsonPatch.applyPatch(state.current || state.freight, updateRecord.load.patch, false, false);
    return {
      ...state,
      current: next.newDocument,
      log: state.log.concat(updateRecord.cid),
      anchor: {
        status: AnchoringStatus.NOT_REQUESTED,
      },
    };
  },
});
