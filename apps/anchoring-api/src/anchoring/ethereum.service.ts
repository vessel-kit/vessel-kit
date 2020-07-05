import { Injectable } from '@nestjs/common';
import { ConfigService } from '../commons/config.service';
import { ethers } from 'ethers';
import CID from 'cids';
import { ChainID } from 'caip';
import { BlockchainTransaction } from '@potter/anchoring';
import { ConnectionString } from '@potter/blockchain-connection-string';

function walletFromSecret(options: Map<string, string>): ethers.Wallet {
  const key = options.get('key');
  const mnemonic = options.get('mnemonic');
  if (key) {
    return new ethers.Wallet(key);
  } else if (mnemonic) {
    return ethers.Wallet.fromMnemonic(mnemonic, options.get('path'));
  } else {
    throw new Error(`Mnemonic or private key is expected`);
  }
}

@Injectable()
export class EthereumService {
  private readonly wallet: ethers.Wallet;

  constructor(private readonly configService: ConfigService) {
    const connectionString = ConnectionString.fromString(configService.current.BLOCKCHAIN_URL);
    const provider = new ethers.providers.JsonRpcProvider(connectionString.transport);
    this.wallet = walletFromSecret(connectionString.options).connect(provider);
  }

  async createAnchor(cid: CID) {
    const hex = '0x' + cid.buffer.toString('hex');
    const transaction = await this.wallet.sendTransaction({
      to: this.wallet.address,
      data: hex,
    });
    const receipt = await this.wallet.provider.waitForTransaction(transaction.hash);
    const block = await this.wallet.provider.getBlock(receipt.blockHash);
    const chain = new ChainID(`eip155:${transaction.chainId}`)
    return new BlockchainTransaction(chain, receipt.transactionHash, receipt.blockNumber, block.timestamp);
  }
}
