import * as t from 'io-ts';
import { AnchoringStatus } from '@potter/anchoring';
import { HistoryCodec } from '../util/history';
import { CidStringCodec, DateISO8601Codec } from '@potter/codec';

export interface AnchorDone {
  status: AnchoringStatus.ANCHORED,
  proof: {
    chainId: string,
    blockNumber: number,
    timestamp: string,
    txHash: string,
    root: string
  }
}

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

export interface AnchorPending {
  status: AnchoringStatus.PENDING,
  scheduledAt: string
}

const AnchorPending = t.type(
  {
    status: t.literal(AnchoringStatus.PENDING),
    scheduledAt: t.string.pipe(DateISO8601Codec),
  },
  'AnchorPending',
);

export interface AnchorProcessing {
  status: AnchoringStatus.PROCESSING | AnchoringStatus.NOT_REQUESTED | AnchoringStatus.FAILED
}

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

export type AnchorState = AnchorProcessing | AnchorPending | AnchorDone

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
