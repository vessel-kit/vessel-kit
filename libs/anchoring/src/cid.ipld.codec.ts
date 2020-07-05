import * as t from 'io-ts';
import CID from 'cids';

export const CidIpldCodec = new t.Type<CID, CID, unknown>(
  'Cid-Ipld',
  (input: unknown): input is CID => CID.isCID(input),
  (input, context) => {
    if (CID.isCID(input)) {
      return t.success(new CID(input));
    } else {
      return t.failure(input, context, 'CID expected');
    }
  },
  t.identity,
);
