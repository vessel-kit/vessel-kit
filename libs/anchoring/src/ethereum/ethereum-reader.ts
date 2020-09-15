import { IBlockchainReaderHandler } from '../blockchain-reader-handler.interface';
import { AnchorProof } from '../anchor-proof';
import { ChainID } from 'caip';
import { ConnectionString } from '@vessel-kit/blockchain-connection-string';
import { decode, toHexString } from 'multihashes';
import * as hex from '@stablelib/hex';

const ETHEREUM_NAMESPACE = 'eip155';

export class InvalidBlockchainProofError extends Error {}

const EthereumNetworks = new Map<string, string>([
  ['1', 'mainnet'],
  ['3', 'ropsten'],
  ['4', 'rinkeby'],
]);

export class EthereumReader implements IBlockchainReaderHandler {
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
    const txDigest = decode(proofRecord.txHash.multihash).digest;
    const txid = '0x' + toHexString(txDigest);
    const transaction = await provider.getTransaction(txid);
    if (transaction && transaction.blockHash) {
      const block = await provider.getBlock(transaction.blockHash);
      const txData = hex.decode(transaction.data.replace('0x', ''));
      const root = proofRecord.root.bytes;
      const equal = txData.every((byte, i) => byte == root[i]);
      if (!equal) {
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
