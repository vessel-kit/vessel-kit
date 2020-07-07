import { RecordWrap } from '@potter/codec';
import { DocumentState } from '../document.state';
import { AnchorProof } from '@potter/anchoring';

export interface IHandler {
  makeGenesis(content: any): Promise<any & { doctype: string }>;
  applyGenesis(genesis: any): Promise<any & { doctype: string }>;
  applyAnchor(anchorRecord: RecordWrap, proof: AnchorProof, state: DocumentState): Promise<DocumentState>
  applyUpdate(updateRecord: RecordWrap, state: DocumentState)
}
