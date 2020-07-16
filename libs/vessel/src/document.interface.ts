import { CeramicDocumentId } from '@potter/codec';
import CID from 'cids';
import { DocumentState } from './document.state';

export interface IDocument {
  id: CeramicDocumentId;
  head: CID;
  state: DocumentState;
}
