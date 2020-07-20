import { ILogger } from './util/logger.interface';
import { Cloud } from './cloud/cloud';
import { CeramicDocumentId } from '@potter/codec';
import { Document } from './document/document';
import { DocumentService } from './document.service';
import { MessageTyp } from './cloud/message-typ';
import { DoctypesContainer } from './doctypes-container';

export class DocumentRepository {
  #logger: ILogger;
  #doctypes: DoctypesContainer;
  #cloud: Cloud;
  #documentService: DocumentService;
  #documentCache: Map<string, Document>;

  constructor(logger: ILogger, doctypes: DoctypesContainer, cloud: Cloud, documentService: DocumentService) {
    this.#logger = logger.withContext(DocumentRepository.name);
    this.#doctypes = doctypes;
    this.#cloud = cloud;
    this.#documentService = documentService;
    this.#logger.log(`Constructed DocumentService instance`);
    this.#documentCache = new Map();

    this.#cloud.bus.message$.subscribe((message) => {
      if (message.typ === MessageTyp.REQUEST) {
        const found = this.#documentCache.get(message.id);
        if (found) {
          this.#cloud.bus.publishResponse(found.id, found.head);
        }
      }
    });
  }

  async create(genesisRecord: any): Promise<Document> {
    this.#logger.debug(`Creating document from genesis record`, genesisRecord);
    const doctype = this.#doctypes.get(genesisRecord.doctype);
    this.#logger.debug(`Found handler for doctype "${genesisRecord.doctype}"`);
    const record = await doctype.makeGenesis(genesisRecord);
    this.#logger.debug(`Genesis record is valid for doctype "${doctype.name}"`);
    const cid = await this.#cloud.store(record);
    this.#logger.debug(`Stored record to IPFS as ${cid.toString()}`);
    const documentId = new CeramicDocumentId(cid);
    const document = await this.load(documentId);
    document.requestAnchor();
    return document;
  }

  async load(documentId: CeramicDocumentId): Promise<Document> {
    const found = this.#documentCache.get(documentId.toString());
    if (found) {
      return found;
    } else {
      this.#logger.log(`Loading document ${documentId}...`);
      const genesis = await this.#cloud.retrieve(documentId.cid);
      this.#logger.debug(`Loaded genesis record for ${documentId}`);
      const doctype = this.#doctypes.get(genesis.doctype);
      const state = await doctype.applyGenesis(documentId, genesis);
      const document = new Document(state, this.#documentService);
      this.#documentCache.set(documentId.toString(), document);
      return document;
    }
  }

  async list(): Promise<Document[]> {
    return Array.from(this.#documentCache.values());
  }
}
