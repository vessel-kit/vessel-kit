import { AnchorProof } from './anchor-proof';
import { ChainID } from 'caip';

export interface IBlockchainReaderHandler {
  canAccept(chainID: ChainID): Boolean
  validateProof(chainID: ChainID, proofRecord: AnchorProof): Promise<void>;
}
