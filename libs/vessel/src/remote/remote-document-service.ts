import { FrozenSubject, FrozenSubjectRead } from '../util/frozen-subject';
import { interval, queueScheduler, Observable } from 'rxjs';
import axios from 'axios';
import * as _ from 'lodash';
import { DocId, decodeThrow } from '@vessel-kit/codec';
import { IDocumentService } from '../document/document.service.interface';
import CID from 'cids';
import { IContext } from '../context';
import { filter, map, mergeMap } from 'rxjs/operators';
import { Snapshot, SnapshotCodec } from '../document/document.interface';
import { IDoctype } from '../document/doctype';
import * as t from 'io-ts';

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

  async update<State, Shape>(record: any, handler: IDoctype<State, Shape>, state$: FrozenSubject<Snapshot<State>>): Promise<void> {
    const documentId = state$.value.log.first;
    const response = await axios.put(`${this.#host}/api/v0/document/${documentId}`, record);
    const snapshot = decodeThrow(SnapshotCodec(t.unknown), response.data) as Snapshot<State>
    state$.next(snapshot);
  }

  handleUpdate<A>(docId: DocId, state: Snapshot<A>): void {
    // Noop
  }

  requestAnchor(docId: DocId, cid: CID): void {
    queueScheduler.schedule(async () => {
      const endpoint = `${this.#host}/api/v0/document/${docId.valueOf()}/anchor`;
      await axios.post(endpoint);
    });
  }

  externalUpdates$<State, Shape>(docId: DocId, handler: IDoctype<State, Shape>, state$: FrozenSubjectRead<Snapshot<State>>): Observable<Snapshot<State>> {
    return interval(5000).pipe(
      mergeMap(async () => {
        const response = await axios.get(`${this.#host}/api/v0/document/${docId.valueOf()}`);
        return response.data;
      }),
      map(data => {
        return decodeThrow(SnapshotCodec(t.unknown), data) as Snapshot<State>
      }),
      filter((data) => {
        return !_.isEqual(data, state$.value)
      })
    );
  }
}
