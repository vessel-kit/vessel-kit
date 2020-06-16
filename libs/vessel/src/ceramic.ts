import { ILogger } from './logger/logger.interface';
import { Ipfs } from 'ipfs';
import { ConsoleLogger } from './logger/console-logger';
import { DocumentRepository } from './document.repository';
import { Cloud } from './cloud';
import { DocumentService } from './document.service';
import { RemoteEthereumAnchoringService } from './anchoring/remote-ethereum-anchoring-service';
import { AnchoringService } from './anchoring.service';
import { ThreeIdHandler } from './handlers/three-id-handler';
import { DocumentUpdateService } from './document-update.service';
import { HandlersContainer } from './handlers/handlers.container';

export interface CeramicOptions {
  logger: ILogger;
  anchoringEndpoint: string
  ethereumEndpoint: string
}

export class Ceramic {
  #documentRepository: DocumentRepository

  constructor(ipfs: Ipfs, options: CeramicOptions) {
    const logger = options.logger
    const handlers = new HandlersContainer(new Map([
      ['3id', new ThreeIdHandler()]
    ]))
    const cloud = new Cloud(ipfs)
    const ethereumAnchoringService = new RemoteEthereumAnchoringService(logger, options.anchoringEndpoint)
    const ethereumEndpoint = options.ethereumEndpoint
    const anchoringService = new AnchoringService(logger, ethereumEndpoint, ethereumAnchoringService, cloud)
    const documentUpdateService = new DocumentUpdateService(logger, handlers, anchoringService, cloud)
    const documentService = new DocumentService(logger, anchoringService, cloud, documentUpdateService)
    this.#documentRepository = new DocumentRepository(logger, handlers, cloud, documentService)
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
