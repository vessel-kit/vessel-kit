import CID from 'cids';
import { DocumentState } from '../document.state';

export interface IHandler {
  applyGenesis(record: any, cid: CID): Promise<any>
  makeGenesis(record: any): Promise<any>
  makeRecord(state: DocumentState, nextOrProof: any): Promise<any>
  applySigned (record: any, cid: CID, state: DocumentState): Promise<DocumentState>;
}
