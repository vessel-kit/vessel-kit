import { ILogger } from './logger/logger.interface';
import { Ipfs } from 'ipfs';
import { ConsoleLogger } from './logger/console-logger';
import { DocumentRepository } from './document.repository';
import { Cloud } from './cloud';
import { DocumentService } from './document.service';
import { RemoteEthereumAnchoringService } from './anchoring/remote-ethereum-anchoring-service';
import { AnchoringService } from './anchoring.service';

export interface CeramicOptions {
  logger: ILogger;
  anchoringEndpoint: string
  ethereumEndpoint: string
}

export class Ceramic {
  #documentRepository: DocumentRepository

  constructor(ipfs: Ipfs, options: CeramicOptions) {
    const logger = options.logger
    const dispatcher = new Cloud(ipfs)
    const ethereumAnchoringService = new RemoteEthereumAnchoringService(logger, options.anchoringEndpoint)
    const ethereumEndpoint = options.ethereumEndpoint
    const anchoringService = new AnchoringService(logger, ethereumEndpoint, ethereumAnchoringService, dispatcher)
    const documentService = new DocumentService(logger, anchoringService, dispatcher)
    this.#documentRepository = new DocumentRepository(logger, documentService)
    logger.log(`Constructed Ceramic instance`, options)
  }

  static async build(ipfs: Ipfs, options?: CeramicOptions) {
    const appliedOptions = Object.assign({
      logger: new ConsoleLogger('Ceramic'),
      anchoringEndpoint: 'http://localhost:3000',
      ethereumEndpoint: 'http://localhost:8545'
    }, options);
    return new Ceramic(ipfs, appliedOptions);
  }

  async create(genesis: any) {
    return this.#documentRepository.create(genesis)
  }
}
