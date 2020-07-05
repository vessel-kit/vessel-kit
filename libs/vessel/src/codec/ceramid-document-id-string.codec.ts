import * as t from 'io-ts';
import { CeramicDocumentId } from '@potter/codec';

export const CeramicDocumentIdStringCodec = new t.Type<CeramicDocumentId, string, string>(
  'CeramicDocumentIdString',
  (input: unknown): input is CeramicDocumentId => input instanceof CeramicDocumentId,
  (input, context) => {
    try {
      return t.success(CeramicDocumentId.fromString(input));
    } catch (e) {
      t.failure(input, context, 'Invalid Ceramic document id');
    }
  },
  (a: CeramicDocumentId) => a.toString(),
);
