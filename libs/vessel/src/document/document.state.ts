import * as t from 'io-ts';
import { AnchoringStatus } from '@potter/anchoring';
import { HistoryCodec } from '../util/history';
import { CidStringCodec, DateISO8601Codec } from '@potter/codec';

const AnchorDone = t.type(
  {
    status: t.literal(AnchoringStatus.ANCHORED),
    proof: t.type({
      chainId: t.string,
      blockNumber: t.number,
      timestamp: t.string.pipe(DateISO8601Codec),
      txHash: t.string.pipe(CidStringCodec),
      root: t.string.pipe(CidStringCodec),
    }),
  },
  'AnchorDone',
);

const AnchorPending = t.type(
  {
    status: t.literal(AnchoringStatus.PENDING),
    scheduledAt: t.string.pipe(DateISO8601Codec),
  },
  'AnchorPending',
);

const AnchorProcessing = t.type(
  {
    status: t.union([
      t.literal(AnchoringStatus.PROCESSING),
      t.literal(AnchoringStatus.NOT_REQUESTED),
      t.literal(AnchoringStatus.FAILED),
    ]),
  },
  'AnchorProcessing',
);

export const AnchorState = t.union([AnchorProcessing, AnchorPending, AnchorDone], 'AnchorState');

export const DocumentState = t.type(
  {
    doctype: t.string,
    current: t.union([t.UnknownRecord, t.null]),
    freight: t.UnknownRecord,
    anchor: AnchorState,
    log: HistoryCodec,
  },
  'DocumentState',
);

export type DocumentState = t.TypeOf<typeof DocumentState>;
