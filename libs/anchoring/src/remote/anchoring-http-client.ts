import { Observable, queueScheduler, Subject } from 'rxjs';
import CID from 'cids';
import { filter } from 'rxjs/operators';
import axios from 'axios';
import { CeramicDocumentId, decodePromise } from '@potter/codec';
import * as t from 'io-ts';
import { AnchorResponsePayload } from './anchor-response-payload';
import { AnchorRequestPayload } from './anchor-request-payload';
import { AnchoringStatus } from '../anchoring-status';

export type AnchorResponsePayloadType = t.TypeOf<typeof AnchorResponsePayload>;

export class AnchoringHttpClient {
  #observation$ = new Subject<AnchorResponsePayloadType>();
  #anchoringEndpoint: string;
  #period: number;

  constructor(anchoringEndpoint: string, period: number = 5000) {
    this.#anchoringEndpoint = anchoringEndpoint;
    this.#period = period;
  }

  anchorStatus$(docId: CeramicDocumentId): Observable<AnchorResponsePayloadType> {
    const subject = new Subject<AnchorResponsePayloadType>();
    this.#observation$.pipe(filter((o) => o.docId.toString() === docId.toString())).subscribe(subject);
    return subject.asObservable();
  }

  requestAnchor(docId: CeramicDocumentId, cid: CID) {
    queueScheduler.schedule(async () => {
      const endpoint = `${this.#anchoringEndpoint}/api/v0/requests`;
      const payload = AnchorRequestPayload.encode({
        docId,
        cid,
      });
      const response = await axios.post(endpoint, payload);
      const decoded = await decodePromise(AnchorResponsePayload, response.data);
      this.#observation$.next(decoded);
      this.startRequestingAnchorStatus(docId, cid);
    });
  }

  startRequestingAnchorStatus(docId: CeramicDocumentId, cid: CID) {
    const doRequest = async () => {
      const status = await this.requestAnchorStatus(docId, cid);
      if (status !== AnchoringStatus.ANCHORED) {
        setTimeout(() => {
          queueScheduler.schedule(() => doRequest());
        }, this.#period);
      }
    };
    queueScheduler.schedule(() => doRequest());
  }

  async requestAnchorStatus(docId: CeramicDocumentId, cid: CID) {
    try {
      const endpoint = `${this.#anchoringEndpoint}/api/v0/requests/${cid.toString()}`;
      const response = await axios.get(endpoint);
      const decoded = await decodePromise(AnchorResponsePayload, response.data);
      const status = response.data.status as AnchoringStatus;
      this.#observation$.next(decoded);
      return status;
    } catch (e) {
      this.#observation$.error(e);
    }
  }
}
