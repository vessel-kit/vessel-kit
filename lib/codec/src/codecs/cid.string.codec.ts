import * as t from 'io-ts';
import CID from 'cids';

export const CidStringCodec = new t.Type<CID, string, string>(
  'CID-string',
  (input: unknown): input is CID => CID.isCID(input),
  (input, context) => {
    try {
      return t.success(new CID(input));
    } catch (e) {
      return t.failure(input, context, e.message);
    }
  },
  (cid) => cid.toString(),
);
