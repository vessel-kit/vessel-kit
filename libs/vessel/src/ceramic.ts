import { ILogger } from './logger/logger.interface';
import { Ipfs } from 'ipfs';
import { ConsoleLogger } from './logger/console-logger';

export interface CeramicOptions {
  logger: ILogger;
}

export class Ceramic {
  #ipfs: Ipfs

  constructor(ipfs: Ipfs, options?: CeramicOptions) {
    this.#ipfs = ipfs
  }

  static async build(ipfs: Ipfs, options?: CeramicOptions) {
    const appliedOptions = Object.assign({
      logger: new ConsoleLogger(),
    });
    return new Ceramic(ipfs, appliedOptions);
  }
}
