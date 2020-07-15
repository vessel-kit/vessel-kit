import * as t from 'io-ts';
import { CeramicDocumentId } from '../ceramic-document-id';
import CID from 'cids';

export const CeramicDocumentIdCidCodec = new t.Type<CeramicDocumentId, CID, CID>(
  'CeramicDocumentId-CID',
  (input: unknown): input is CeramicDocumentId => input instanceof CeramicDocumentId,
  (input, context) => {
    return t.success(new CeramicDocumentId(input));
  },
  (a) => a.cid,
);
