import { FrozenSubject } from '../util/frozen-subject';
import { IWithDoctype } from './with-doctype.interface';
import { CeramicDocumentId } from '@potter/codec';
// import { ITypedDocument } from './typed-document.interface';
import { IDoctype } from './doctype';
import { History, HistoryCodec } from '../util/history';
import * as t from 'io-ts'

export interface Snapshot<A> {
  doctype: string;
  view: A;
  log: History;
}

export function SnapshotCodec<A>(codec: t.Type<A, unknown, any>) {
  return t.type({
    doctype: t.string,
    view: codec,
    log: HistoryCodec
  })
}

export interface IDocument<State> {
  id: CeramicDocumentId;
  log: History;
  state: Snapshot<State>;
  state$: FrozenSubject<Snapshot<State>>;
  current: State;
  update(record: any): Promise<void>;
  requestAnchor(): void;
  // TODO Typed work
  // as<F extends IWithDoctype>(doctype: IDoctype<any, F>): ITypedDocument<F>;
  close(): void;
  toJSON(): any;
}
