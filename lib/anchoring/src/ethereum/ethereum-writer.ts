import { ConnectionString } from '@vessel-kit/blockchain-connection-string';
import { ethers } from 'ethers';
import CID from 'cids';
import { ChainID } from 'caip';
import { BlockchainTransaction } from '../blockchain-transaction';
import { IBlockchainWriter } from '../blockchain-writer.interface';
import { toHexString } from 'multihashes';

export class InvalidKeyMaterialError extends Error {}

function walletFromConnectionString(connectionString: ConnectionString) {
  const options = connectionString.options;
  const privateKeyHex = options.get('privateKeyHex');
  const mnemonic = options.get('mnemonic');
  if (privateKeyHex) {
    return new ethers.Wallet(privateKeyHex);
  } else if (mnemonic) {
    const hdPath = options.get('path');
    return ethers.Wallet.fromMnemonic(mnemonic, hdPath);
  } else {
    throw new InvalidKeyMaterialError(`Mnemonic or private key is expected`);
  }
}

export class EthereumWriter implements IBlockchainWriter {
  #wallet: ethers.Wallet;

  constructor(wallet: ethers.Wallet) {
    this.#wallet = wallet;
  }

  static fromConnectionString(connectionString: ConnectionString): EthereumWriter {
    const provider = new ethers.providers.JsonRpcProvider(connectionString.transport);
    const wallet = walletFromConnectionString(connectionString).connect(provider);
    return new EthereumWriter(wallet);
  }

  async createAnchor(cid: CID): Promise<BlockchainTransaction> {
    const hex = '0x' + toHexString(cid.bytes);
    const transaction = await this.#wallet.sendTransaction({
      to: this.#wallet.address,
      data: hex,
    });
    const receipt = await this.#wallet.provider.waitForTransaction(transaction.hash);
    const block = await this.#wallet.provider.getBlock(receipt.blockHash);
    const chainId = new ChainID(`eip155:${transaction.chainId}`);
    return new BlockchainTransaction(chainId, receipt.transactionHash, receipt.blockNumber, block.timestamp);
  }
}
