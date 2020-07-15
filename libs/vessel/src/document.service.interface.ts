import { FrozenSubject } from './frozen-subject';
import { DocumentState } from './document.state';
import { Subscription } from 'rxjs';
import { CeramicDocumentId } from '@potter/codec';
import CID from 'cids';
import { IContext } from './context';

export interface IDocumentService {
  context: IContext;
  requestUpdates(docId: CeramicDocumentId, state$: FrozenSubject<DocumentState>): Subscription;
  update(record: any, state$: FrozenSubject<DocumentState>): Promise<void>;
  requestAnchor(docId: CeramicDocumentId, cid: CID): void;
}
