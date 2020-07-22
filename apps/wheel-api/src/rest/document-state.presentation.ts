import { Document } from '@potter/vessel';
import { AnchoringStatus } from '@potter/anchoring';
import { IDocument } from '@potter/vessel';

export class DocumentStatePresentation {
  constructor(private readonly document: IDocument) {}

  toJSON() {
    return {
      docId: this.document.id.cid.toString(),
      state: this.document.state,
      anchorStatus: this.document.state.anchor,
    };
  }
}
