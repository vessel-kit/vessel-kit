import { Document} from '@potter/vessel'

export class DocumentStatePresentation {
  constructor(private readonly document: Document) {
  }

  toJSON() {
    return {
      docId: this.document.id.cid.toString(),
      state: this.document.state,
      anchorStatus: this.document.state.anchor
    }
  }
}
