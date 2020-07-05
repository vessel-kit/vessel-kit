import * as t from 'io-ts';
import { AnchoringStatus } from '../anchoring-status';
import { CidStringCodec, CeramicDocumentIdStringCodec, DateNumberCodec } from '@potter/codec';

const Failed = t.type({
  status: t.literal(AnchoringStatus.FAILED),
  cid: t.string.pipe(CidStringCodec),
  docId: t.string.pipe(CeramicDocumentIdStringCodec),
});

const Pending = t.type({
  status: t.union([t.literal(AnchoringStatus.PENDING), t.literal(AnchoringStatus.PROCESSING)]),
  cid: t.string.pipe(CidStringCodec),
  docId: t.string.pipe(CeramicDocumentIdStringCodec),
  scheduledAt: t.number.pipe(DateNumberCodec),
});

const Anchored = t.type({
  status: t.literal(AnchoringStatus.ANCHORED),
  cid: t.string.pipe(CidStringCodec),
  docId: t.string.pipe(CeramicDocumentIdStringCodec),
  anchorRecord: t.string.pipe(CidStringCodec),
});

export const AnchorResponsePayload = t.union([Anchored, Pending, Failed]);
