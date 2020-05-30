import * as t from 'io-ts';
import { AnchoringStatus } from './anchoring/anchoring-status';
import { CidCodec } from './codec/cid-codec';
import { DateStringCodec } from './codec/date-string.codec';
import { ChainCidArrayCodec } from './codec/chain-cid-array.codec';

const AnchorDone = t.type(
  {
    status: t.literal(AnchoringStatus.ANCHORED),
    proof: t.type({
      chainId: t.string,
      blockNumber: t.number,
      timestamp: t.string.pipe(DateStringCodec),
      txHash: t.string.pipe(CidCodec),
      root: t.string.pipe(CidCodec),
    }),
  },
  'AnchorDone',
);

const AnchorPending = t.type(
  {
    status: t.literal(AnchoringStatus.PENDING),
    scheduledAt: t.string.pipe(DateStringCodec),
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

export const DocumentStateCodec = t.type(
  {
    doctype: t.string,
    current: t.union([t.UnknownRecord, t.null]),
    freight: t.UnknownRecord,
    anchor: AnchorState,
    log: t.array(t.string.pipe(CidCodec)).pipe(ChainCidArrayCodec),
  },
  'DocumentState',
);

export type DocumentState = t.TypeOf<typeof DocumentStateCodec>
