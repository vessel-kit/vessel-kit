import * as t from 'io-ts';
import { DocId } from '../doc-id';
import CID from 'cids';

export const DocIdCidCodec = new t.Type<DocId, CID, CID>(
  'DocId-CID',
  (input: unknown): input is DocId => input instanceof DocId,
  (input) => {
    return t.success(new DocId(input));
  },
  (a) => a.cid,
);
