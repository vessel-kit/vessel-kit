import * as t from 'io-ts';
import { CidStringCodec } from '@potter/codec';
import { CeramicDocumentIdStringCodec } from '@potter/codec';

export const AnchorRequestPayload = t.type({
  cid: t.string.pipe(CidStringCodec),
  docId: t.string.pipe(CeramicDocumentIdStringCodec),
});
