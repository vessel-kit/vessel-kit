import * as t from 'io-ts';
import { CidStringCodec, CeramicDocumentIdStringCodec } from '@vessel-kit/codec';

export const AnchorRequestPayload = t.type({
  cid: t.string.pipe(CidStringCodec),
  docId: t.string.pipe(CeramicDocumentIdStringCodec),
});
