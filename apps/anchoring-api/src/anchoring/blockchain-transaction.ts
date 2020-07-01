import { encode } from 'typestub-multihashes';
import CID from 'cids';

export class BlockchainTransaction {
  readonly cid: CID;

  constructor(
    readonly chain: string,
    readonly txHash: string,
    readonly blockNumber: number,
    readonly blockTimestamp: number,
  ) {
    const bytes = Buffer.from(txHash.replace(/0x/, ''), 'hex');
    const multihash = encode(bytes, 'keccak-256');
    const cidVersion = 1;
    this.cid = new CID(cidVersion, 'eth-tx', multihash);
  }
}
