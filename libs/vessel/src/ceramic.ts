import { ILogger } from './logger/logger.interface';
import { Ipfs } from 'ipfs';
import { ConsoleLogger } from './logger/console-logger';
import { DocumentService } from './document.service';

export interface CeramicOptions {
  logger: ILogger;
}

export class Ceramic {
  #ipfs: Ipfs
  #logger: ILogger
  #documentService: DocumentService

  constructor(ipfs: Ipfs, options: CeramicOptions) {
    this.#ipfs = ipfs
    this.#logger = options.logger
    this.#logger.log(`Constructed Ceramic instance`)
    this.#documentService = new DocumentService(options.logger)
  }

  static async build(ipfs: Ipfs, options?: CeramicOptions) {
    const appliedOptions = Object.assign({
      logger: new ConsoleLogger(),
    }, options);
    return new Ceramic(ipfs, appliedOptions);
  }

  async create(genesis: any & {doctype: string}) {
    this.#logger.debug(`Creating document from genesis record`, genesis)
  }
}
