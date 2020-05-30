import { ILogger } from './logger/logger.interface';
import { UnknownDoctypeError } from './unknown-doctype.error';
import { IHandler } from './handlers/handler.interface';
import { ThreeIdHandler } from './handlers/three-id-handler';
import { Cloud } from './cloud';
import { CeramicDocumentId } from './ceramic-document-id';
import { Document } from './document';
import { DocumentService } from './document.service';

export class DocumentRepository {
  #logger: ILogger
  #handlers: Map<string, IHandler>
  #dispatcher: Cloud
  #documentService: DocumentService

  constructor(logger: ILogger, documentService: DocumentService) {
    this.#logger = logger.withContext(DocumentRepository.name)
    this.#handlers = new Map([
      ['3id', new ThreeIdHandler(documentService.dispatcher, documentService.anchoring)]
    ])
    this.#dispatcher = documentService.dispatcher
    this.#documentService = documentService
    this.#logger.log(`Constructed DocumentService instance`)
  }

  handler(doctype: string) {
    const handler = this.#handlers.get(doctype)
    if (handler) {
      return handler
    } else {
      throw new UnknownDoctypeError(doctype)
    }
  }

  async create(genesis: any) {
    this.#logger.debug(`Creating document from genesis record`, genesis)
    const doctype = genesis.doctype
    const handler = this.handler(doctype)
    this.#logger.debug(`Found handler for doctype "${doctype}"`)
    const record = await handler.makeGenesis(genesis)
    this.#logger.debug(`Genesis record is valid for doctype "${doctype}"`)
    const cid = await this.#dispatcher.store(record)
    this.#logger.debug(`Stored record to IPFS as ${cid.toString()}`)
    const documentId = new CeramicDocumentId(cid)
    const document = await this.load(documentId)
    document.requestAnchor()
    return document
  }

  async load(documentId: CeramicDocumentId) {
    this.#logger.log(`Loading document ${documentId}...`)
    const genesis = await this.#dispatcher.retrieve(documentId.cid)
    this.#logger.debug(`Loaded genesis record for ${documentId}`)
    const handler = this.handler(genesis.doctype)
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
