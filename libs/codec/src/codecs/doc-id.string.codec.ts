import * as t from 'io-ts';
import { DocId } from '../doc-id';
import CID from 'cids';
import { CidStringCodec } from './cid.string.codec';

const PATTERN = new RegExp(/(vessel:\/\/|\/vessel\/)(\w+)/);

export const DocIdStringCodec = new t.Type<DocId, string, string>(
  'DocId-string',
  (input: unknown): input is DocId => input instanceof DocId,
  (input, context) => {
    try {
      const match = PATTERN.exec(input);
      if (match && match[2]) {
        const cidString = match[2];
        const cid = new CID(cidString);
        return t.success(new DocId(cid));
      } else {
        const cid = new CID(input);
        return t.success(new DocId(cid));
      }
    } catch (e) {
      return t.failure(input, context, 'Invalid DocId');
    }
  },
  (a: DocId) => `vessel://${CidStringCodec.encode(a.cid)}`,
);
