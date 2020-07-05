import { Document } from '@potter/vessel'

export class DocumentPresentation {
  constructor(private readonly document: Document) {}

  toJSON() {
    return {
      docId: this.document.id.valueOf(),
      ...this.document.state
    };
  }
}
