import { ILogger } from './logger/logger.interface';
import { Cloud } from './cloud/cloud';
import { CeramicDocumentId } from '@potter/codec';
import { Document } from './document';
import { DocumentService } from './document.service';
import { HandlersContainer } from './handlers/handlers.container';
import { MessageTyp } from './cloud/message-typ';

export class DocumentRepository {
  #logger: ILogger
  #handlers: HandlersContainer
  #cloud: Cloud
  #documentService: DocumentService
  #documentCache: Map<string, Document>

  constructor(logger: ILogger, handlers: HandlersContainer, cloud: Cloud, documentService: DocumentService) {
    this.#logger = logger.withContext(DocumentRepository.name)
    this.#handlers = handlers
    this.#cloud = cloud
    this.#documentService = documentService
    this.#logger.log(`Constructed DocumentService instance`)
    this.#documentCache = new Map()

    this.#cloud.bus.message$.subscribe(message => {
      if (message.typ === MessageTyp.REQUEST) {
        const found = this.#documentCache.get(message.id)
        if (found) {
          this.#cloud.bus.publishResponse(found.id, found.head)
        }
      }
    })
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
    const found = this.#documentCache.get(documentId.toString())
    if (found) {
      return found
    } else {
      this.#logger.log(`Loading document ${documentId}...`)
      const genesis = await this.#cloud.retrieve(documentId.cid)
      this.#logger.debug(`Loaded genesis record for ${documentId}`)
      const handler = this.#handlers.get(genesis.doctype)
      const freight = await handler.applyGenesis(genesis)
      const document = new Document(documentId, freight, this.#documentService)
      document.requestUpdates()
      this.#documentCache.set(documentId.toString(), document)
      return document
    }
  }

  async list(): Promise<Document[]> {
    return Array.from(this.#documentCache.values())
  }
}
