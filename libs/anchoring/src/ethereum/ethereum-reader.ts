import { IBlockchainReader } from '../blockchain-reader.interface';
import { AnchorProof } from '../anchor-proof';
import { ChainID } from 'caip';
import { ConnectionString } from '@potter/blockchain-connection-string';
import { decode } from 'typestub-multihashes';

const ETHEREUM_NAMESPACE = 'eip155';

export class InvalidBlockchainProofError extends Error {}

const EthereumNetworks = new Map<string, string>([
  ['1', 'mainnet'],
  ['3', 'ropsten'],
  ['4', 'rinkeby'],
]);

export class EthereumReader implements IBlockchainReader {
  constructor(readonly ethereumEndpoint: ConnectionString) {}

  canAccept(chainID: ChainID): Boolean {
    const namespace = chainID.namespace;
    return namespace === ETHEREUM_NAMESPACE;
  }

  async validateProof(chainId: ChainID, proofRecord: AnchorProof): Promise<void> {
    const network = EthereumNetworks.get(chainId.namespace);
    const providers = await import('@ethersproject/providers');
    const provider = network
      ? providers.getDefaultProvider(network)
      : new providers.JsonRpcProvider(this.ethereumEndpoint.transport);
    const txid = '0x' + decode(proofRecord.txHash.multihash).digest.toString('hex');
    const transaction = await provider.getTransaction(txid);
    if (transaction && transaction.blockHash) {
      const block = await provider.getBlock(transaction.blockHash);
      const txData = Buffer.from(transaction.data.replace('0x', ''), 'hex');
      const root = proofRecord.root.buffer as Buffer;
      if (!txData.equals(root)) {
        throw new InvalidBlockchainProofError(`Proof Merkle root ${proofRecord.root} is not in transaction ${txid}`);
      }
      if (proofRecord.blockNumber !== transaction.blockNumber) {
        throw new InvalidBlockchainProofError(
          `Block numbers diverge: ${proofRecord.blockNumber} in proof vs ${transaction.blockNumber} in tx`,
        );
      }
      if (proofRecord.blockTimestamp !== block.timestamp) {
        throw new InvalidBlockchainProofError(
          `Block timestamps diverge: ${proofRecord.blockTimestamp} in proof vs ${block.timestamp} in block`,
        );
      }
    } else {
      throw new InvalidBlockchainProofError(`Can not find transaction`);
    }
  }
}
