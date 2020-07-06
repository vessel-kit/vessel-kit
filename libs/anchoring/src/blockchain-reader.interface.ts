import { AnchorProof } from './anchor-proof';
import { ChainID } from 'caip';

export interface IBlockchainReader {
  canAccept(chainID: ChainID): Boolean
  validateProof(chainID: ChainID, proofRecord: AnchorProof): Promise<void>;
}
