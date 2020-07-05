import { encode } from 'typestub-multihashes';
import CID from 'cids';
import { ChainID } from 'caip';

export class UnknownChainTxCodecError extends Error {
  constructor(chain: ChainID) {
    super(`Unkown CID tx codec for chain namespace ${chain.namespace}`);
  }
}

export function txCodec(chainId: ChainID) {
  switch (chainId.namespace) {
    case 'eip155':
      return 'eth-tx';
    case 'ethereum':
      return 'eth-tx';
    default:
      throw new UnknownChainTxCodecError(chainId);
  }
}

export class BlockchainTransaction {
  readonly cid: CID;

  constructor(
    readonly chainId: ChainID,
    readonly txHash: string,
    readonly blockNumber: number,
    readonly blockTimestamp: number,
  ) {
    const bytes = Buffer.from(txHash.replace(/0x/, ''), 'hex');
    const multihash = encode(bytes, 'keccak-256');
    const cidVersion = 1;
    const codec = txCodec(chainId);
    this.cid = new CID(cidVersion, codec, multihash);
  }
}
