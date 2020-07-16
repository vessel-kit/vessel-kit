import { FrozenSubject, FrozenSubjectRead } from './frozen-subject';
import { DocumentState } from './document.state';
import { Observable } from 'rxjs';
import { CeramicDocumentId } from '@potter/codec';
import CID from 'cids';
import { IContext } from './context';

export interface IDocumentService {
  context: IContext;
  update(record: any, state$: FrozenSubject<DocumentState>): Promise<void>;
  requestAnchor(docId: CeramicDocumentId, cid: CID): void;
  externalUpdates$(docId: CeramicDocumentId, state$: FrozenSubjectRead<DocumentState>): Observable<DocumentState>;
}
