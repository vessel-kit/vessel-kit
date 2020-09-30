import { ConnectionString } from '@vessel-kit/blockchain-connection-string';
import { EthereumWriter } from './ethereum/ethereum-writer';
import { IBlockchainWriter } from './blockchain-writer.interface';

export class UnknownBlockchainWriterChainError extends Error {
  constructor(chain: string) {
    super(`No anchoring writer for chain ${chain}`);
  }
}

export class BlockchainWriter {
  static fromConnectionString(connectionString: ConnectionString): IBlockchainWriter {
    switch (connectionString.chain) {
      case 'eip155':
        return EthereumWriter.fromConnectionString(connectionString);
      default:
        throw new UnknownBlockchainWriterChainError(connectionString.chain);
    }
  }
}
