import { Injectable } from '@nestjs/common';
import { ConfigService } from '../commons/config.service';
import { ethers } from 'ethers';
import querystring from 'querystring';
import CID from 'cids';
import { BlockchainTransaction } from './blockchain-transaction';

function providerForUrl(blockchainUrl: string) {
  const rpcEndpoint = blockchainUrl.replace(/^ethereum\+/, '');
  return new ethers.providers.JsonRpcProvider(rpcEndpoint);
}

function walletFromSecret(secret: string): ethers.Wallet {
  const params = querystring.parse(secret);
  if (params.key) {
    return new ethers.Wallet(params.key as string);
  } else if (params.mnemonic) {
    return ethers.Wallet.fromMnemonic(params.mnemonic as string, params.path as string | undefined);
  } else {
    throw new Error(`Mnemonic or private key is expected`);
  }
}

@Injectable()
export class EthereumService {
  private readonly wallet: ethers.Wallet;

  constructor(private readonly configService: ConfigService) {
    const provider = providerForUrl(configService.current.BLOCKCHAIN_URL);
    this.wallet = walletFromSecret(configService.current.BLOCKCHAIN_SECRET).connect(provider);
  }

  async createAnchor(cid: CID) {
    const hex = '0x' + cid.buffer.toString('hex');
    const transaction = await this.wallet.sendTransaction({
      to: this.wallet.address,
      data: hex,
    });
    const receipt = await this.wallet.provider.waitForTransaction(transaction.hash);
    const block = await this.wallet.provider.getBlock(receipt.blockHash);
    const chain = `eip155:${transaction.chainId}`;
    return new BlockchainTransaction(chain, receipt.transactionHash, receipt.blockNumber, block.timestamp);
  }
}
