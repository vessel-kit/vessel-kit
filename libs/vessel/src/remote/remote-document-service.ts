import { FrozenSubject } from '../frozen-subject';
import { DocumentState } from '../document.state';
import { interval, Subscription } from 'rxjs';
import axios from 'axios';
import * as _ from 'lodash';
import { ISignorContext } from './client';
import { CeramicDocumentId, decodeThrow } from '@potter/codec';

export class RemoteDocumentService {
  #host: string;
  #context: ISignorContext;

  constructor(host: string, context: ISignorContext) {
    this.#host = host;
    this.#context = context;
  }

  get context() {
    return this.#context;
  }

  // TODO When merging with local one, return subscription too
  requestUpdates(docId: CeramicDocumentId, state$: FrozenSubject<DocumentState>): Subscription {
    const timer = interval(5000);
    return timer.subscribe(async () => {
      const response = await axios.get(`${this.#host}/api/v0/ceramic/${docId.valueOf()}`);
      if (!_.isEqual(response.data, DocumentState.encode(state$.value))) {
        const state = decodeThrow(DocumentState, response.data);
        state$.next(state);
      }
    });
  }

  async update(record: any, state$: FrozenSubject<DocumentState>) {
    const documentId = state$.value.log.first;
    const response = await axios.put(`${this.#host}/api/v0/ceramic/${documentId}`, record);
    const next = decodeThrow(DocumentState, response.data)
    state$.next(next)
  }
}
