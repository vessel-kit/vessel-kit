import * as t from 'io-ts';
import { DocIdCidCodec, CidObjectCodec, FastPatchOperationJsonCodec } from '@vessel-kit/codec';

export const UpdateRecordWaiting = t.type({
  patch: t.array(FastPatchOperationJsonCodec),
  prev: CidObjectCodec,
  id: CidObjectCodec.pipe(DocIdCidCodec),
});
