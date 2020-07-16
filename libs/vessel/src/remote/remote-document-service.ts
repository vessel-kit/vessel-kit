import { FrozenSubject, FrozenSubjectRead } from '../frozen-subject';
import { DocumentState } from '../document.state';
import { interval, queueScheduler, Observable } from 'rxjs';
import axios from 'axios';
import * as _ from 'lodash';
import { CeramicDocumentId, decodeThrow } from '@potter/codec';
import { IDocumentService } from '../document.service.interface';
import CID from 'cids';
import { IContext } from '../context';
import { filter, map, mergeMap } from 'rxjs/operators';

export class RemoteDocumentService implements IDocumentService {
  #host: string;
  #context: IContext;

  constructor(host: string, context: IContext) {
    this.#host = host;
    this.#context = context;
  }

  get context() {
    return this.#context;
  }

  async update(record: any, state$: FrozenSubject<DocumentState>): Promise<void> {
    const documentId = state$.value.log.first;
    const response = await axios.put(`${this.#host}/api/v0/ceramic/${documentId}`, record);
    const next = decodeThrow(DocumentState, response.data);
    state$.next(next);
  }

  handleUpdate(docId: CeramicDocumentId, state: DocumentState) {
    // Noop
  }

  requestAnchor(docId: CeramicDocumentId, cid: CID): void {
    queueScheduler.schedule(async () => {
      const endpoint = `${this.#host}/api/v0/ceramic/${docId.valueOf()}/anchor`;
      await axios.post(endpoint);
    });
  }

  externalUpdates$(docId, state$: FrozenSubjectRead<DocumentState>): Observable<DocumentState> {
    return interval(5000).pipe(
      mergeMap(async () => {
        const response = await axios.get(`${this.#host}/api/v0/ceramic/${docId.valueOf()}`);
        return response.data;
      }),
      filter((data) => !_.isEqual(data, DocumentState.encode(state$.value))),
      map((data) => decodeThrow(DocumentState, data)),
    );
  }
}
