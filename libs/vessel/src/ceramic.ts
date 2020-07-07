import { ILogger } from './logger/logger.interface';
import { Ipfs } from 'ipfs';
import { ConsoleLogger } from './logger/console-logger';
import { DocumentRepository } from './document.repository';
import { Cloud } from './cloud/cloud';
import { DocumentService } from './document.service';
import { AnchoringService } from './anchoring.service';
import { ThreeIdHandler } from './handlers/three-id-handler';
import { DocumentUpdateService } from './document-update.service';
import { HandlersContainer } from './handlers/handlers.container';
import { CeramicDocumentId } from '@potter/codec';
import { AnchoringHttpClient } from '@potter/anchoring';
import { ConnectionString } from '@potter/blockchain-connection-string';

export interface CeramicOptions {
  logger?: ILogger;
  anchoringEndpoint?: string;
  blockchainEndpoints?: ConnectionString[];
}

export class Ceramic {
  #documentRepository: DocumentRepository;

  constructor(ipfs: Ipfs, options: CeramicOptions) {
    const logger = options.logger;
    const handlers = new HandlersContainer(new Map([['3id', new ThreeIdHandler()]]));
    const cloud = new Cloud(logger, ipfs);
    const anchoring = new AnchoringHttpClient(options.anchoringEndpoint);
    const blockchainEndpoints = options.blockchainEndpoints || [];
    const anchoringService = new AnchoringService(blockchainEndpoints, anchoring, cloud);
    const documentUpdateService = new DocumentUpdateService(logger, handlers, anchoringService, cloud);
    const documentService = new DocumentService(logger, anchoringService, cloud, documentUpdateService);
    this.#documentRepository = new DocumentRepository(logger, handlers, cloud, documentService);
    logger.log(`Constructed Ceramic instance`, options);
  }

  static build(ipfs: Ipfs, options?: CeramicOptions) {
    const appliedOptions = Object.assign(
      {
        logger: new ConsoleLogger('Ceramic'),
        anchoringEndpoint: 'http://localhost:3000',
        ethereumEndpoint: 'http://localhost:8545',
      },
      options,
    );
    return new Ceramic(ipfs, appliedOptions);
  }

  async create(genesis: any) {
    return this.#documentRepository.create(genesis);
  }

  async load(docId: CeramicDocumentId) {
    return this.#documentRepository.load(docId);
  }

  async list() {
    return this.#documentRepository.list();
  }
}
