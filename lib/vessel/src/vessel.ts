import { ILogger } from './util/logger.interface';
import { Ipfs } from 'ipfs';
import { ConsoleLogger } from './util/console-logger';
import { DocumentRepository } from './document.repository';
import { Cloud } from './cloud/cloud';
import { DocumentService } from './document.service';
import { AnchoringService } from './anchoring.service';
import { DocumentUpdateService } from './document-update.service';
import { DocId } from '@vessel-kit/codec';
import { AnchoringHttpClient } from '@vessel-kit/anchoring';
import { ConnectionString } from '@vessel-kit/blockchain-connection-string';
import { Context } from './context';
import { DoctypesContainer } from './doctypes-container';
import { ThreeIdDoctype } from './doctypes/three-id/three-id-doctype';
import { TileDoctype } from './doctypes/tile/tile-doctype';
import { VesselRulesetAlphaDoctype } from './doctypes/vessel-ruleset-alpha-doctype';
import { VesselDocumentAlphaDoctype } from './doctypes/vessel-document-alpha-doctype';
import { IDocument } from './document/document.interface';
import { IIdentitySigning } from "@vessel-kit/identity";

export interface Options {
  logger: ILogger;
  anchoringEndpoint: string;
  blockchainEndpoints: ConnectionString[];
}

export class Vessel {
  #documentRepository: DocumentRepository;
  #signor?: IIdentitySigning;

  constructor(ipfs: Ipfs, options: Options) {
    const logger = options.logger;
    const cloud = new Cloud(logger, ipfs);
    const anchoring = new AnchoringHttpClient(options.anchoringEndpoint);
    const blockchainEndpoints = options.blockchainEndpoints || [];
    const anchoringService = new AnchoringService(blockchainEndpoints, anchoring, cloud);
    const context = new Context(
      () => {
        if (this.#signor) {
          return this.#signor;
        } else {
          throw new Error(`No signor set`);
        }
      },
      this.load.bind(this),
      cloud.retrieve.bind(cloud),
      anchoringService,
    );
    const doctypes = new DoctypesContainer(
      [ThreeIdDoctype, TileDoctype, VesselRulesetAlphaDoctype, VesselDocumentAlphaDoctype],
      context,
    );
    const documentUpdateService = new DocumentUpdateService(logger, cloud);
    const documentService = new DocumentService(logger, anchoringService, cloud, documentUpdateService, context);
    this.#documentRepository = new DocumentRepository(logger, doctypes, cloud, documentService);
    logger.log(`Constructed Vessel instance`, options);
  }

  // TODO addSignor

  static build(ipfs: Ipfs, options?: Partial<Options>): Vessel {
    const appliedOptions = Object.assign(
      {
        logger: new ConsoleLogger('vessel'),
        anchoringEndpoint: 'http://localhost:3000',
        ethereumEndpoint: 'http://localhost:8545',
        blockchainEndpoints: [],
      },
      options,
    );
    return new Vessel(ipfs, appliedOptions);
  }

  async create(genesis: any): Promise<IDocument<unknown, unknown>> {
    return this.#documentRepository.create(genesis);
  }

  async load(docId: DocId): Promise<IDocument<unknown, unknown>> {
    return this.#documentRepository.load(docId);
  }

  async history(docId: DocId): Promise<any> {
    return this.#documentRepository.history(docId);
  }

  async list(): Promise<IDocument<unknown, unknown>[]> {
    return this.#documentRepository.list();
  }

  close(): void {
    this.#documentRepository.close();
  }
}
