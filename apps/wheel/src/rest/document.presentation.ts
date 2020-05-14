import { Document } from '../lib/ceramic/document';

export class DocumentPresentation {
  constructor(private readonly document: Document) {}

  toJSON() {
    return {
      docId: this.document.docId,
      ...this.document.body
    };
  }
}
