import * as jose from 'jose';
import * as t from 'io-ts';
import { JWKMulticodecCodec } from '../signor/jwk.multicodec.codec';
import { BufferMultibaseCodec, typeAsCodec, RecordWrap } from '@potter/codec';
import { doctype } from '../document/doctype';
import { DocumentState } from '../document/document.state';
import produce from 'immer';
import { AnchoringStatus, AnchorProof } from '@potter/anchoring';
import { IWithDoctype } from '../document/with-doctype.interface';
import { CeramicDocumentId, decodeThrow } from '@potter/codec';
import { Chain } from '..';

export interface ThreeIdFreight {
  doctype: '3id';
  owners: jose.JWK.Key[];
  content: {
    publicKeys: {
      signing: jose.JWK.Key;
      encryption: jose.JWK.Key;
    };
  };
}

const ThreeIdFreightCodec = t.type({
  doctype: t.literal('3id'),
  owners: t.array(t.string.pipe(BufferMultibaseCodec).pipe(JWKMulticodecCodec)),
  content: t.type({
    publicKeys: t.type({
      encryption: t.string.pipe(BufferMultibaseCodec).pipe(JWKMulticodecCodec),
      signing: t.string.pipe(BufferMultibaseCodec).pipe(JWKMulticodecCodec),
    }),
  }),
});

export const ThreeId = doctype('3id', typeAsCodec(ThreeIdFreightCodec), {
  async makeGenesis(payload: ThreeIdFreight): Promise<any & IWithDoctype> {
    return ThreeIdFreightCodec.encode(payload);
  },
  async applyGenesis(documentId: CeramicDocumentId, genesis: any): Promise<DocumentState> {
    const freight = decodeThrow(ThreeIdFreightCodec, genesis);
    return {
      doctype: freight.doctype,
      current: null,
      freight: freight,
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
    console.log('ThreeId.applyUpdate');
    return state;
  },
});
