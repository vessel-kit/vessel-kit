import * as t from 'io-ts';
import { CeramicDocumentId } from '../ceramic-document-id';
import CID from 'cids';
import { CidStringCodec } from './cid.string.codec';

const PATTERN = new RegExp(/(ceramic:\/\/|\/ceramic\/)(\w+)/);

export const CeramicDocumentIdStringCodec = new t.Type<CeramicDocumentId, string, string>(
  'CeramicDocumentId-string',
  (input: unknown): input is CeramicDocumentId => input instanceof CeramicDocumentId,
  (input, context) => {
    try {
      const match = PATTERN.exec(input);
      if (match && match[2]) {
        const cidString = match[2];
        const cid = new CID(cidString);
        return t.success(new CeramicDocumentId(cid));
      } else {
        const cid = new CID(input);
        return t.success(new CeramicDocumentId(cid));
      }
    } catch (e) {
      t.failure(input, context, 'Invalid Ceramic document id');
    }
  },
  (a: CeramicDocumentId) => `ceramic://${CidStringCodec.encode(a.cid)}`,
);
