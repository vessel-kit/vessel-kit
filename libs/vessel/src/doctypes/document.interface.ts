import CID from 'cids';
import { DocumentState } from '../document.state';
import { FrozenSubject } from '../frozen-subject';
import { IWithDoctype } from './with-doctype.interface';
import { IDoctype } from './doctype.interface';
import { CeramicDocumentId } from '@potter/codec';

export interface ITypedDocument<F extends IWithDoctype> {
  freight: F;
  update(next: F, opts?: { useMgmt: boolean }): Promise<void>;
}

export interface IDocument {
  id: CeramicDocumentId;
  head: CID;
  state: DocumentState;
  current: any;
  state$: FrozenSubject<DocumentState>;
  update(record: any): Promise<void>;
  requestAnchor(): void;
  as<F extends IWithDoctype>(doctype: IDoctype<F>): ITypedDocument<F>;
  close(): void;
  toJSON(): any;
}
