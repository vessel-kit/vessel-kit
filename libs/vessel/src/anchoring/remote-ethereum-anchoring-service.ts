import { Observable, queueScheduler, Subject } from 'rxjs';
import CID from 'cids';
import { filter, map } from 'rxjs/operators';
import axios from 'axios';
import { AnchoringStatus } from '@potter/anchoring';
import { CeramicDocumentId } from '@potter/codec';
import { ILogger } from '../logger/logger.interface';
import * as t from 'io-ts';
import * as tPromise from 'io-ts-promise';
import { CidStringCodec } from '@potter/codec';
import { DateTimestampCodec } from '../codec/date-timestamp.codec';
import { CeramicDocumentIdStringCodec } from '@potter/codec';

const FailedResponse = t.type({
  status: t.literal(AnchoringStatus.FAILED),
  cid: t.string.pipe(CidStringCodec),
  docId: t.string.pipe(CeramicDocumentIdStringCodec),
});

const PendingResponse = t.type({
  status: t.union([t.literal(AnchoringStatus.PENDING), t.literal(AnchoringStatus.PROCESSING)]),
  cid: t.string.pipe(CidStringCodec),
  docId: t.string.pipe(CeramicDocumentIdStringCodec),
  scheduledAt: t.number.pipe(DateTimestampCodec),
});

const AnchoredResponse = t.type({
  status: t.literal(AnchoringStatus.ANCHORED),
  cid: t.string.pipe(CidStringCodec),
  docId: t.string.pipe(CeramicDocumentIdStringCodec),
  anchorRecord: t.string.pipe(CidStringCodec),
});

const AnchoringResponse = t.union([AnchoredResponse, PendingResponse, FailedResponse]);

export type Observation = t.TypeOf<typeof AnchoringResponse>;

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
      const response = await axios.post(endpoint, {
        docId: docId.toString(),
        cid: cid.toString(),
      });
      this.#logger.debug(`Done requesting anchor for ${docId.toString()}?version=${cid.toString()}`);
      const decoded = await tPromise.decode(AnchoringResponse, response.data);
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
      const decoded = await tPromise.decode(AnchoringResponse, response.data);
      const status = response.data.status as AnchoringStatus;
      this.#logger.debug(`${docId.toString()}?version=${cid.toString()} is ${status}`);
      this.#observation$.next(decoded);
      return status;
    } catch (e) {
      this.#logger.error(e);
    }
  }
}
