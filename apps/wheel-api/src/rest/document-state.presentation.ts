import { IDocument } from '@potter/vessel';

export class DocumentStatePresentation {
  constructor(private readonly document: IDocument<unknown>) {}

  toJSON() {
    return {
      docId: this.document.id.cid.toString(),
      state: this.document.state,
    };
  }
}
