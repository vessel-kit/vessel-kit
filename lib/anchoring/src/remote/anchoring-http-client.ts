import { Observable, queueScheduler, Subject } from 'rxjs';
import CID from 'cids';
import { filter } from 'rxjs/operators';
import axios from 'axios';
import { DocId, decodeThrow } from '@vessel-kit/codec';
import * as t from 'io-ts';
import { AnchorResponsePayload } from './anchor-response-payload';
import { AnchorRequestPayload } from './anchor-request-payload';
import { AnchoringStatus } from '../anchoring-status';

export type AnchorResponsePayloadType = t.TypeOf<typeof AnchorResponsePayload>;

class NamedSchedule {
  #tasks: Set<string> = new Set();

  add(name: string, task: () => Promise<void>) {
    if (!this.#tasks.has(name)) {
      this.#tasks.add(name);
      queueScheduler.schedule(async () => {
        await task();
        this.#tasks.delete(name);
      });
    }
  }
}

export class AnchoringHttpClient {
  #observation$ = new Subject<AnchorResponsePayloadType>();
  #anchoringEndpoint: string;
  #period: number;
  #schedule = new NamedSchedule();

  constructor(anchoringEndpoint: string, period: number = 5000) {
    this.#anchoringEndpoint = anchoringEndpoint;
    this.#period = period;
  }

  anchorStatus$(docId: DocId): Observable<AnchorResponsePayloadType> {
    const subject = new Subject<AnchorResponsePayloadType>();
    this.#observation$.pipe(filter((o) => o.docId.toString() === docId.toString())).subscribe(subject);
    return subject.asObservable();
  }

  requestAnchor(docId: DocId, cid: CID) {
    queueScheduler.schedule(async () => {
      const endpoint = `${this.#anchoringEndpoint}/api/v0/requests`;
      const payload = AnchorRequestPayload.encode({
        docId,
        cid,
      });
      const response = await axios.post(endpoint, payload);
      const decoded = decodeThrow(AnchorResponsePayload, response.data);
      this.#observation$.next(decoded);
      this.startRequestingAnchorStatus(docId, cid);
    });
  }

  startRequestingAnchorStatus(docId: DocId, cid: CID) {
    const taskName = `${docId}:${cid}`;
    this.#schedule.add(taskName, () => {
      return new Promise((resolve) => {
        const doRequest = async () => {
          const status = await this.requestAnchorStatus(cid);
          if (
            status === AnchoringStatus.ANCHORED ||
            status === AnchoringStatus.FAILED ||
            status === AnchoringStatus.OUTDATED
          ) {
            resolve();
          } else {
            queueScheduler.schedule(() => doRequest(), this.#period);
          }
        };
        return doRequest();
      });
    });
  }

  async requestAnchorStatus(cid: CID): Promise<AnchoringStatus | null> {
    try {
      const endpoint = `${this.#anchoringEndpoint}/api/v0/requests/${cid.toString()}`;
      const response = await axios.get(endpoint);
      const decoded = decodeThrow(AnchorResponsePayload, response.data);
      const status = response.data.status as AnchoringStatus;
      this.#observation$.next(decoded);
      return status;
    } catch (e) {
      this.#observation$.error(e);
      return null;
    }
  }
}
