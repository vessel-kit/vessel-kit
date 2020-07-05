import * as t from 'io-ts';
import CID from 'cids';

export const CidCodec = new t.Type<CID, string, string>(
  'CID',
  (input: unknown): input is CID => CID.isCID(input),
  (input, context) => {
    try {
      return t.success(new CID(input));
    } catch (e) {
      t.failure(input, context, 'Invalid CID');
    }
  },
  (a: CID) => CID.toString(),
);
