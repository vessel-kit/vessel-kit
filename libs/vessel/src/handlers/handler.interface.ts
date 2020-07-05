import { RecordWrap } from '../record-wrap';
import { DocumentState } from '../document.state';
import { ProofRecord } from '../anchoring.service';

export interface IHandler {
  makeGenesis(content: any): Promise<any & { doctype: string }>;
  applyGenesis(genesis: any): Promise<any & { doctype: string }>;
  applyAnchor(anchorRecord: RecordWrap, proof: ProofRecord, state: DocumentState): Promise<DocumentState>
  applyUpdate(updateRecord: RecordWrap, state: DocumentState)
}
