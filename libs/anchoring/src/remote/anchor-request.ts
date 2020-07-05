import * as t from 'io-ts'
import { ChainIdStringCodec } from '../chain-id.string.codec';
import { CidStringCodec } from '../cid.string.codec';

export const AnchorRequest = t.type({
  cid: t.string.pipe(CidStringCodec)
})
