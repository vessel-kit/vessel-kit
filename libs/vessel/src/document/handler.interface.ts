import { IWithDoctype } from './with-doctype.interface';
import { DocumentState } from './document.state';
import { RecordWrap, CeramicDocumentId } from '@potter/codec';
import { AnchorProof } from '@potter/anchoring';

export interface IHandler<Freight extends IWithDoctype> {
  // Return payload as JSON
  makeGenesis(payload: Omit<Freight, 'doctype'>): Promise<any & IWithDoctype>;
  applyGenesis(documentId: CeramicDocumentId, genesis: any): Promise<DocumentState>;
  applyAnchor(anchorRecord: RecordWrap, proof: AnchorProof, state: DocumentState): Promise<DocumentState>;
  applyUpdate(updateRecord: RecordWrap, state: DocumentState): Promise<DocumentState>;
}
