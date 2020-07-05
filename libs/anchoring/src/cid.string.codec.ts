import * as t from 'io-ts';
import CID from 'cids';

export const CidStringCodec = new t.Type<CID, string, unknown>(
  'CID-string',
  (input: unknown): input is CID => CID.isCID(input),
  (input, context) => {
    if (CID.isCID(input)) {
      return t.success(new CID(input));
    } else {
      return t.failure(input, context, 'CID expected');
    }
  },
  (cid) => cid.toString(),
);
