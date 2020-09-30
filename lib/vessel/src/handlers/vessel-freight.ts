import * as t from 'io-ts';
import { CidStringCodec } from '@vessel-kit/codec';

export const VESSEL_RULESET_DOCTYPE = 'vessel/ruleset/0.0.1';
export const VESSEL_DOCUMENT_DOCTYPE = 'vessel/document/0.0.1';

export const VesselRuleset = t.type({
  doctype: t.literal(VESSEL_RULESET_DOCTYPE),
  content: t.type({
    type: t.literal(`application/javascript`),
    main: t.string,
  }),
});

export const VesselDocument = t.type({
  doctype: t.literal(VESSEL_DOCUMENT_DOCTYPE),
  ruleset: t.string.pipe(CidStringCodec),
  content: t.UnknownRecord,
});
