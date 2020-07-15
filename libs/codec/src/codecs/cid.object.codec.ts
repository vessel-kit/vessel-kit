import * as t from 'io-ts';
import { CidStringCodec } from './cid.string.codec';
import CID from 'cids';

export interface CidObject {
  '/': string;
}

export const CidObjectCodec = new t.Type<CID, CidObject, unknown>(
  'CID-CidObject',
  (input: unknown): input is CID => CID.isCID(input),
  (input, context) => {
    if (typeof input === 'object' && input['/'] && typeof input['/'] === 'string') {
      const cidString = input['/'];
      return CidStringCodec.decode(cidString);
    } else {
      return t.failure(input, context, 'Not a CIDObject');
    }
  },
  (a) => {
    return { '/': CidStringCodec.encode(a) };
  },
);
