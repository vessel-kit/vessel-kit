import CID from 'cids';
import axios from 'axios';
import { CeramicDocumentId } from '@potter/vessel';
import PQueue from 'p-queue';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AnchorStatus } from './anchor-status';
import { filter, map, tap } from 'rxjs/operators';

export class EthereumAnchorService {
  private readonly queue = new PQueue();
  private readonly observations = new Subject<{
    cid: CID;
    status: AnchorStatus;
  }>();
  constructor(private readonly anchoringEndpoint: string) {}

  anchorStatus$(cid: CID): Observable<AnchorStatus> {
    const subject = new BehaviorSubject(AnchorStatus.PENDING);
    this.observations
      .pipe(
        filter(o => o.cid.toString() === cid.toString()),
        map(o => o.status),
      )
      .subscribe(subject);
    return subject.pipe(
      tap(o => {
        console.log(`Get anchor for ${cid.toString()}: ${o}`);
      }),
    );
  }

  async requestAnchor(cid: CID): Promise<void> {
    return this.queue.add(async () => {
      const docId = new CeramicDocumentId(cid);
      const endpoint = `${this.anchoringEndpoint}/api/v0/requests`;
      await axios.post(endpoint, {
        docId: docId.toString(),
        cid: cid.toString(),
      });
      this.observations.next({ cid: cid, status: AnchorStatus.PENDING });
    });
  }

  async requestAnchorStatus(cid: CID): Promise<void> {
    return this.queue.add(async () => {
      try {
        const endpoint = `${
          this.anchoringEndpoint
        }/api/v0/requests/${cid.toString()}`;
        const response = await axios.get(endpoint);
        const status = response.data.status as AnchorStatus;
        this.observations.next({ cid: cid, status });
      } catch (e) {
        console.error('requestAnchorStatus');
        console.error(e);
      }
    });
  }
}
