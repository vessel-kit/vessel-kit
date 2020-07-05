import { ConnectionString } from '@potter/blockchain-connection-string';
import { ethers } from 'ethers';
import CID from 'cids';
import { ChainID } from 'caip';
import { BlockchainTransaction } from '../blockchain-transaction';

export class InvalidKeyMaterialError extends Error {}

export class EthereumWriter {
  #wallet: ethers.Wallet;

  constructor(wallet: ethers.Wallet) {
    this.#wallet = wallet;
  }

  static fromConnectionString(connectionString: ConnectionString): EthereumWriter {
    const options = connectionString.options;
    const privateKeyHex = options.get('privateKeyHex');
    const mnemonic = options.get('mnemonic');
    if (privateKeyHex) {
      return new EthereumWriter(new ethers.Wallet(privateKeyHex));
    } else if (mnemonic) {
      const hdPath = options.get('path');
      return new EthereumWriter(ethers.Wallet.fromMnemonic(mnemonic, hdPath));
    } else {
      throw new InvalidKeyMaterialError(`Mnemonic or private key is expected`);
    }
  }

  async createAnchor(cid: CID) {
    const hex = '0x' + cid.buffer.toString('hex');
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
