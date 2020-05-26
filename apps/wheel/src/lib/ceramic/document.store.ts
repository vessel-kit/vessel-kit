import { Document } from './document';
import CID from 'cids';
import { DocumentStorage } from '../../storage/document.storage';
import { DocumentRecord } from '../../storage/document.record';
import { MessageBus } from './message-bus';
import { FileStore } from './file-store';
import { EthereumAnchorService } from './ethereum-anchor-service';

export class DocumentStore {
  private readonly mapping = new Map<string, Document>();

  constructor(
    private readonly storage: DocumentStorage,
    private readonly messageBus: MessageBus,
    private readonly fileStore: FileStore,
    private readonly anchoringService: EthereumAnchorService,
  ) {
  }

  async put(document: Document): Promise<void> {
    this.mapping.set(document.cid.toString(), document);
    const found = await this.storage.byId(document.cid);
    if (!found) {
      const documentRecord = new DocumentRecord();
      documentRecord.cid = document.cid;
      documentRecord.payload = document.body;
      documentRecord.doctype = document.body.doctype;
      await this.storage.save(documentRecord);
    }
  }

  async count() {
    return this.storage.count();
  }

  async get(docId: CID): Promise<Document | undefined> {
    if (this.mapping.has(docId.toString())) {
      return this.mapping.get(docId.toString());
    } else {
      const record = await this.storage.byId(docId);
      const document = new Document(
        docId,
        record,
        [],
        this.fileStore,
        this.messageBus,
        this.anchoringService.anchorStatus$(docId),
      );
      this.mapping.set(docId.toString(), document);
      return document;
    }
  }

  async has(docId: CID) {
    const record = await this.storage.byId(docId);
    return !!record;
  }
}
