import { DocumentState } from '../document.state';

export interface IHandler {
  makeGenesis(content: any): Promise<any & { doctype: string }>;
  applyGenesis(genesis: any): Promise<any & { doctype: string }>;
  apply(record: any, state: DocumentState): Promise<DocumentState>;
}
