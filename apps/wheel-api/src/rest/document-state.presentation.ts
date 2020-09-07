import { IDocument } from '@vessel-kit/vessel';

export class DocumentStatePresentation {
  constructor(private readonly document: IDocument<unknown, unknown>) {}

  toJSON() {
    return {
      docId: this.document.id.cid.toString(),
      state: this.document.state,
    };
  }
}
