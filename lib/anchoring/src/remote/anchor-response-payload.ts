import * as t from 'io-ts';
import { AnchoringStatus } from '../anchoring-status';
import { DateISO8601Codec, CidStringCodec, DocIdStringCodec, DateNumberCodec } from '@vessel-kit/codec';

const NotAnchored = t.type({
  status: t.union([
    t.literal(AnchoringStatus.FAILED),
    t.literal(AnchoringStatus.NOT_REQUESTED),
    t.literal(AnchoringStatus.OUTDATED),
  ]),
  id: t.string,
  cid: t.string.pipe(CidStringCodec),
  docId: t.string.pipe(DocIdStringCodec),
  createdAt: t.string.pipe(DateISO8601Codec),
  updatedAt: t.string.pipe(DateISO8601Codec),
});

const Pending = t.type({
  status: t.union([t.literal(AnchoringStatus.PENDING), t.literal(AnchoringStatus.PROCESSING)]),
  id: t.string,
  cid: t.string.pipe(CidStringCodec),
  docId: t.string.pipe(DocIdStringCodec),
  createdAt: t.string.pipe(DateISO8601Codec),
  updatedAt: t.string.pipe(DateISO8601Codec),
  scheduledAt: t.number.pipe(DateNumberCodec),
});

const Anchored = t.type({
  status: t.literal(AnchoringStatus.ANCHORED),
  id: t.string,
  cid: t.string.pipe(CidStringCodec),
  docId: t.string.pipe(DocIdStringCodec),
  anchorRecord: t.string.pipe(CidStringCodec),
  createdAt: t.string.pipe(DateISO8601Codec),
  updatedAt: t.string.pipe(DateISO8601Codec),
});

export const AnchorResponsePayload = t.union([Anchored, Pending, NotAnchored]);
