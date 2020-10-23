import { ILogger } from "./util/logger.interface";
import { Cloud } from "./cloud/cloud";
import { DocId } from "@vessel-kit/codec";
import { Document } from "./document/document";
import { DocumentService } from "./document.service";
import { MessageTyp } from "./cloud/message-typ";
import { DoctypesContainer } from "./doctypes-container";
import { IDocument } from "./document/document.interface";
import { IWithDoctype } from "./document/with-doctype.interface";
import { History } from "./util/history";

export class DocumentRepository {
  #logger: ILogger;
  #doctypes: DoctypesContainer;
  #cloud: Cloud;
  #documentService: DocumentService;
  #documentCache: Map<string, IDocument<unknown, unknown>>;

  constructor(
    logger: ILogger,
    doctypes: DoctypesContainer,
    cloud: Cloud,
    documentService: DocumentService
  ) {
    this.#logger = logger.withContext(DocumentRepository.name);
    this.#doctypes = doctypes;
    this.#cloud = cloud;
    this.#documentService = documentService;
    this.#logger.log(`Constructed DocumentService instance`);
    this.#documentCache = new Map();

    this.#cloud.bus.message$.subscribe((message) => {
      if (message && message.typ === MessageTyp.REQUEST) {
        const found = this.#documentCache.get(message.id);
        if (found) {
          this.#cloud.bus.publishResponse(found.id, found.log.last);
        }
      }
    });
  }

  async create(genesisRecord: any): Promise<IDocument<unknown, unknown>> {
    this.#logger.debug(`Creating document from genesis record`, genesisRecord);
    const doctype = this.#doctypes.get(genesisRecord.doctype);
    this.#logger.debug(`Found handler for doctype "${genesisRecord.doctype}"`);
    const knead = await doctype.knead(genesisRecord);
    const canonical = await doctype.canonical(knead);
    this.#logger.debug(`Genesis record is valid for doctype "${doctype.name}"`);
    const cid = await this.#cloud.store(canonical);
    this.#logger.debug(`Stored record to IPFS as ${cid.toString()}`);
    const documentId = new DocId(cid);
    return this.load(documentId);
  }

  async load(documentId: DocId): Promise<IDocument<unknown, unknown>> {
    const found = this.#documentCache.get(documentId.toString());
    if (found) {
      return found;
    } else {
      this.#logger.log(`Loading document ${documentId}...`);
      const genesis = await this.#cloud.retrieve(documentId.cid);
      this.#logger.debug(`Loaded genesis record for ${documentId}`);
      if (IWithDoctype.is(genesis)) {
        const handler = this.#doctypes.get(genesis.doctype);
        const knead = await handler.knead(genesis);
        const init = {
          doctype: genesis.doctype,
          view: knead,
          log: new History([documentId.cid]),
        };
        const document = new Document(init, handler, this.#documentService);
        this.#documentCache.set(documentId.toString(), document);
        return document;
      } else {
        throw new Error(
          `Expected genesis record, got garbage on ${documentId}`
        );
      }
    }
  }

  async list(): Promise<IDocument<unknown, unknown>[]> {
    return Array.from(this.#documentCache.values());
  }

  async history(documentId: DocId): Promise<any[]> {
    const result = [];
    let currentCID = documentId.cid;
    let currentElement = await this.#cloud.retrieve(currentCID);
    while (currentElement.prev) {
      currentCID = currentElement.prev.toString();
      currentElement = await this.#cloud.retrieve(currentCID);
      result.push({ ...currentElement, cid: currentCID });
    }
    return result;
  }

  close(): void {
    this.#documentCache.forEach((document) => {
      document.close();
    });
  }
}
