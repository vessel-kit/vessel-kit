import { Document} from '../lib/ceramic/document'

export class DocumentStatePresentation {
  constructor(private readonly document: Document) {
  }

  toJSON() {
    return {
      docId: this.document.docId,
      state: this.document.state,
      anchorStatus: this.document.anchorStatus
    }
  }
}
