import { Document } from './document';
import CID from 'cids';

export class DocumentStore {
  private readonly store = new Map<string, Document>();

  put(document: Document) {
    if (!this.store.has(document.cid.toString())) {
      this.store.set(document.cid.toString(), document);
    }
  }

  async count() {
    return this.store.size;
  }

  set(docId: CID, document: Document) {
    this.store.set(docId.toString(), document);
  }

  get(docId: CID) {
    return this.store.get(docId.toString());
  }

  has(docId: CID) {
    return this.store.has(docId.toString());
  }

  delete(docId: CID) {
    return this.store.delete(docId.toString());
  }
}
