import { Observable, queueScheduler, Subject } from 'rxjs';
import CID from 'cids';
import { filter } from 'rxjs/operators';
import axios from 'axios';
import { AnchoringStatus } from '@potter/anchoring';
import { CeramicDocumentId, decodePromise } from '@potter/codec';
import { ILogger } from '../logger/logger.interface';
import * as t from 'io-ts';
import { AnchorRequestPayload, AnchorResponsePayload } from '@potter/anchoring';

export type Observation = t.TypeOf<typeof AnchorResponsePayload>;

export class RemoteEthereumAnchoringService {
  #observation$ = new Subject<Observation>();
  #logger: ILogger;
  #anchoringEndpoint: string;

  constructor(logger: ILogger, anchoringEndpoint: string) {
    this.#logger = logger.withContext(RemoteEthereumAnchoringService.name);
    this.#anchoringEndpoint = anchoringEndpoint;
  }

  anchorStatus$(docId: CeramicDocumentId): Observable<Observation> {
    const subject = new Subject<Observation>();
    this.#observation$.pipe(filter((o) => o.docId.toString() === docId.toString())).subscribe(subject);
    return subject.asObservable();
  }

  requestAnchor(docId: CeramicDocumentId, cid: CID) {
    queueScheduler.schedule(async () => {
      const endpoint = `${this.#anchoringEndpoint}/api/v0/requests`;
      this.#logger.debug(`Requesting anchor for ${docId.toString()}?version=${cid.toString()}`);
      const payload = AnchorRequestPayload.encode({
        docId,
        cid,
      });
      const response = await axios.post(endpoint, payload);
      this.#logger.debug(`Done requesting anchor for ${docId.toString()}?version=${cid.toString()}`);
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
        }, 5000);
      }
    };
    queueScheduler.schedule(() => doRequest());
  }

  async requestAnchorStatus(docId: CeramicDocumentId, cid: CID) {
    try {
      this.#logger.debug(`Requesting anchoring status for ${docId.toString()}?version=${cid.toString()}`);
      const endpoint = `${this.#anchoringEndpoint}/api/v0/requests/${cid.toString()}`;
      const response = await axios.get(endpoint);
      const decoded = await decodePromise(AnchorResponsePayload, response.data);
      const status = response.data.status as AnchoringStatus;
      this.#logger.debug(`${docId.toString()}?version=${cid.toString()} is ${status}`);
      this.#observation$.next(decoded);
      return status;
    } catch (e) {
      this.#logger.error(e);
    }
  }
}
