import CID from 'cids';
import { ChainID } from 'caip';
import * as t from 'io-ts';
import { CidIpldCodec } from '@vessel-kit/codec';
import { ChainIdStringCodec } from './chain-id.string.codec';

export interface AnchorProof {
  readonly blockNumber: number;
  readonly blockTimestamp: number;
  readonly chainId: ChainID;
  readonly root: CID;
  readonly txHash: CID;
}

interface IAnchorProofIpld {
  readonly blockNumber: number,
  readonly blockTimestamp: number,
  readonly root: CID,
  readonly chainId: string,
  readonly txHash: CID,
}

export const AnchorProofIpldCodec: t.Type<AnchorProof, IAnchorProofIpld> = t.type({
  blockNumber: t.number,
  blockTimestamp: t.number,
  root: CidIpldCodec,
  chainId: t.string.pipe(ChainIdStringCodec),
  txHash: CidIpldCodec,
});
