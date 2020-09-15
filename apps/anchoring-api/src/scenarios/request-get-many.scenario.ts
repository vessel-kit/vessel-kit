import { Injectable } from '@nestjs/common';
import { RequestStorage } from '../storage/request.storage';
import CID from 'cids';
import { AnchorStorage } from '../storage/anchor.storage';
import { AnchoringScheduleService } from '../anchoring/anchoring-schedule.service';
import { RequestPresentation } from './request-get.scenario';

@Injectable()
export class RequestGetManyScenario {
  constructor(
    private readonly requestStorage: RequestStorage,
    private readonly anchoringSchedule: AnchoringScheduleService,
    private readonly anchorStorage: AnchorStorage,
  ) {}

  async execute(cidString: string) {
    const cid = new CID(cidString);
    const requests = await this.requestStorage.byDocIdMany(cid);
    return await Promise.all(
      requests.map(async (r) => {
        const anchor = await this.anchorStorage.byRequestId(r.id);
        const cronJob = this.anchoringSchedule.get(this.anchoringSchedule.triggerAnchoring);
        if (!cronJob) {
          throw new Error(`Can not find ${this.anchoringSchedule.triggerAnchoring.name} cron job`)
        }
        const nextAnchoring = cronJob.nextDate().toDate();
        return new RequestPresentation(r, anchor, nextAnchoring);
      }),
    );
  }
}
