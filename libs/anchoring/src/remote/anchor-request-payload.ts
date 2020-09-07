import * as t from 'io-ts';
import { CidStringCodec, DocIdStringCodec } from '@vessel-kit/codec';

export const AnchorRequestPayload = t.type({
  cid: t.string.pipe(CidStringCodec),
  docId: t.string.pipe(DocIdStringCodec),
});
