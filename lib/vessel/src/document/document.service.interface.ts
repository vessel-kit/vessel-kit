import { FrozenSubject, FrozenSubjectRead } from '../util/frozen-subject';
import { Observable } from 'rxjs';
import { DocId } from '@vessel-kit/codec';
import CID from 'cids';
import { IContext } from '../context';
import { Snapshot } from './document.interface';
import { IDoctype } from './doctype';

export interface IDocumentService {
  context: IContext;
  update<State, Shape>(record: any, handler: IDoctype<State, Shape>, state$: FrozenSubject<Snapshot<State>>): Promise<void>
  requestAnchor(docId: DocId, cid: CID): void;
  handleUpdate<State>(docId: DocId, state: Snapshot<State>): void;
  externalUpdates$<State, Shape>(docId: DocId, handler: IDoctype<State, Shape>, state$: FrozenSubjectRead<Snapshot<State>>): Observable<Snapshot<State>>
}
