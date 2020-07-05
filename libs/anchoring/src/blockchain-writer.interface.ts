import CID from 'cids';
import { BlockchainTransaction } from './blockchain-transaction';

export interface IBlockchainWriter {
  createAnchor(cid: CID): Promise<BlockchainTransaction>
}
