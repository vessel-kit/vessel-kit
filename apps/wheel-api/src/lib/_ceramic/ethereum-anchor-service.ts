import CID from 'cids';
import axios from 'axios';
import { CeramicDocumentId } from '@potter/codec';
import { BehaviorSubject, Observable, Subject, queueScheduler } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { AnchoringStatus } from '@potter/anchoring';

export class EthereumAnchorService {
  private readonly observations = new Subject<{
    cid: CID;
    status: AnchoringStatus;
  }>();
  constructor(private readonly anchoringEndpoint: string) {}

  anchorStatus$(cid: CID): Observable<AnchoringStatus> {
    const subject = new BehaviorSubject(AnchoringStatus.PENDING);
    this.observations
      .pipe(
        filter((o) => o.cid.toString() === cid.toString()),
        map((o) => o.status),
      )
      .subscribe(subject);
    return subject.asObservable();
  }

  requestAnchor(cid: CID) {
    queueScheduler.schedule(async () => {
      const docId = new CeramicDocumentId(cid);
      const endpoint = `${this.anchoringEndpoint}/api/v0/requests`;
      await axios.post(endpoint, {
        docId: docId.toString(),
        cid: cid.toString(),
      });
      this.observations.next({ cid: cid, status: AnchoringStatus.PENDING });
      this.startRequestingAnchorStatus(cid);
    });
  }

  startRequestingAnchorStatus(cid: CID) {
    const doRequest = async () => {
      const status = await this.requestAnchorStatus(cid);
      if (status !== AnchoringStatus.ANCHORED) {
        setTimeout(() => {
          queueScheduler.schedule(() => doRequest());
        }, 3000);
      }
    };
    queueScheduler.schedule(() => doRequest());
  }

  async requestAnchorStatus(cid: CID) {
    try {
      console.log(`Requesting anchoring status for ${cid.toString()}`);
      const endpoint = `${
        this.anchoringEndpoint
      }/api/v0/requests/${cid.toString()}`;
      const response = await axios.get(endpoint);
      const status = response.data.status as AnchoringStatus;
      this.observations.next({ cid: cid, status });
      return status;
    } catch (e) {
      console.error('requestAnchorStatus');
      console.error(e);
    }
  }
}
