import { IWithDoctype } from './with-doctype.interface';
import { DocumentState } from '../document.state';
import { RecordWrap } from '@potter/codec';

export interface IHandler<Freight extends IWithDoctype> {
  // Return payload as JSON
  makeGenesis(payload: Omit<Freight, 'doctype'>): Promise<any>;
  applyUpdate(updateRecord: RecordWrap, state: DocumentState): Promise<DocumentState>;
}
