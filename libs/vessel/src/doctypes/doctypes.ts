import { DocumentState } from '../document.state';
import { RecordWrap } from '@potter/codec';

export interface WithDoctype {
  doctype: string;
}

export type Doctype<A extends WithDoctype> = {
  makeGenesis(payload: Omit<A, 'doctype'>): Promise<any>;
  applyUpdate(updateRecord: RecordWrap, state: DocumentState): Promise<DocumentState>;
};

export type DoctypeStatic<A extends WithDoctype> = {
  NAME: string;
  FREIGHT: A;
  new (): Doctype<A>;
};
