import * as t from 'io-ts';
import { AnchoringStatus } from '../anchoring-status';
import { DateISO8601Codec, CidStringCodec, CeramicDocumentIdStringCodec, DateNumberCodec } from '@potter/codec';

const Failed = t.type({
  status: t.union([t.literal(AnchoringStatus.FAILED), t.literal(AnchoringStatus.NOT_REQUESTED)]),
  id: t.string,
  cid: t.string.pipe(CidStringCodec),
  docId: t.string.pipe(CeramicDocumentIdStringCodec),
  createdAt: t.string.pipe(DateISO8601Codec),
  updatedAt: t.string.pipe(DateISO8601Codec),
});

const Outdated = t.type({
  status: t.literal(AnchoringStatus.OUTDATED),
  id: t.string,
  cid: t.string.pipe(CidStringCodec),
  docId: t.string.pipe(CeramicDocumentIdStringCodec),
  createdAt: t.string.pipe(DateISO8601Codec),
  updatedAt: t.string.pipe(DateISO8601Codec),
});

const Pending = t.type({
  status: t.union([t.literal(AnchoringStatus.PENDING), t.literal(AnchoringStatus.PROCESSING)]),
  id: t.string,
  cid: t.string.pipe(CidStringCodec),
  docId: t.string.pipe(CeramicDocumentIdStringCodec),
  createdAt: t.string.pipe(DateISO8601Codec),
  updatedAt: t.string.pipe(DateISO8601Codec),
  scheduledAt: t.number.pipe(DateNumberCodec),
});

const Anchored = t.type({
  status: t.literal(AnchoringStatus.ANCHORED),
  id: t.string,
  cid: t.string.pipe(CidStringCodec),
  docId: t.string.pipe(CeramicDocumentIdStringCodec),
  anchorRecord: t.string.pipe(CidStringCodec),
  createdAt: t.string.pipe(DateISO8601Codec),
  updatedAt: t.string.pipe(DateISO8601Codec),
});

export const AnchorResponsePayload = t.union([Anchored, Pending, Failed, Outdated]);
