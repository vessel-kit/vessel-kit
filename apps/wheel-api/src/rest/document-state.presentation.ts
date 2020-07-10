import { Document } from '@potter/vessel';
import { AnchoringStatus } from '@potter/anchoring';

export class DocumentStatePresentation {
  constructor(private readonly document: Document) {}

  toJSON() {
    return {
      docId: this.document.id.cid.toString(),
      state: this.document.state,
      anchorStatus: this.document.state.anchor,
    };
  }
}
