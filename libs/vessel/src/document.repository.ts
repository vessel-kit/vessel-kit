import { ILogger } from './logger/logger.interface';
import { UnknownDoctypeError } from './unknown-doctype.error';
import { IHandler } from './handlers/handler.interface';
import { ThreeIdHandler } from './handlers/three-id-handler';
import { Cloud } from './cloud';
import { CeramicDocumentId } from './ceramic-document-id';
import { Document } from './document';
import { DocumentService } from './document.service';
import { HandlersContainer } from './handlers/handlers.container';

export class DocumentRepository {
  #logger: ILogger
  #handlers: HandlersContainer
  #cloud: Cloud
  #documentService: DocumentService

  constructor(logger: ILogger, handlers: HandlersContainer, cloud: Cloud, documentService: DocumentService) {
    this.#logger = logger.withContext(DocumentRepository.name)
    this.#handlers = handlers
    this.#cloud = cloud
    this.#documentService = documentService
    this.#logger.log(`Constructed DocumentService instance`)
  }

  async create(genesis: any) {
    this.#logger.debug(`Creating document from genesis record`, genesis)
    const doctype = genesis.doctype
    const handler = this.#handlers.get(doctype)
    this.#logger.debug(`Found handler for doctype "${doctype}"`)
    const record = await handler.makeGenesis(genesis)
    this.#logger.debug(`Genesis record is valid for doctype "${doctype}"`)
    const cid = await this.#cloud.store(record)
    this.#logger.debug(`Stored record to IPFS as ${cid.toString()}`)
    const documentId = new CeramicDocumentId(cid)
    const document = await this.load(documentId)
    document.requestAnchor()
    return document
  }

  async load(documentId: CeramicDocumentId) {
    this.#logger.log(`Loading document ${documentId}...`)
    const genesis = await this.#cloud.retrieve(documentId.cid)
    this.#logger.debug(`Loaded genesis record for ${documentId}`)
    const handler = this.#handlers.get(genesis.doctype)
    const freight = await handler.applyGenesis(genesis)
    return new Document(documentId, freight, this.#documentService)
    // Load pinned
    // init document:
    // Retrieve genesis
    // apply genesis +
    // set up document updates
    // anchor
    // publish head
  }
}