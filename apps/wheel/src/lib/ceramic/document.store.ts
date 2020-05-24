import { Document } from './document';
import CID from 'cids';
import { DocumentStorage } from '../../storage/document.storage';
import { DocumentRecord } from '../../storage/document.record';

export class DocumentStore {
  constructor(private readonly storage: DocumentStorage) {}

  async put(document: Document): Promise<void> {
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

  async get(docId: CID): Promise<DocumentRecord | undefined> {
    return this.storage.byId(docId);
  }

  async has(docId: CID) {
    const record = await this.storage.byId(docId);
    return !!record;
  }
}
