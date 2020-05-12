import CID from 'cids'

export enum AnchorStatus {
  NOT_REQUESTED,
  PENDING,
  PROCESSING,
  ANCHORED
}

export interface AnchorRecord {
  prev: CID; // should be CID type
  proof: CID; // should be CID type
  path: string;
}

export interface AnchorProof {
  chainId: string;
  blockNumber: number;
  blockTimestamp: number;
  txHash: CID;
  root: CID;
}

export interface AnchorServiceResponse {
  readonly status: string;
  readonly message: string;
  readonly anchorScheduledFor?: number;
  readonly anchorRecord?: CID;
}
