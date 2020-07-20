import CID from 'cids';
import { DocumentState } from './document.state';
import { FrozenSubject } from '../util/frozen-subject';
import { IWithDoctype } from './with-doctype.interface';
import { CeramicDocumentId } from '@potter/codec';
import { ITypedDocument } from './typed-document.interface';
import { IDoctype } from './doctype';

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
