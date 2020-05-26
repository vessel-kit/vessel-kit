import { Injectable } from '@nestjs/common';
import { RequestStorage } from '../storage/request.storage';
import CID from 'cids';
import { RequestRecord } from '../storage/request.record';
import { AnchorStorage } from '../storage/anchor.storage';
import { UnreachableCaseError } from '../unreachable-case.error';
import { AnchorRecord } from '../storage/anchor.record';
import { dateAsTimestamp } from '../api/date-as-timestamp';
import { AnchoringScheduleService } from '../anchoring/anchoring-schedule.service';
import { AnchoringStatus } from '@potter/vessel';

export class RequestPresentation {
  constructor(
    private readonly request: RequestRecord,
    private readonly anchor: AnchorRecord | undefined,
    private readonly nextAnchoring: Date,
  ) {}

  toJSON() {
    switch (this.request.status) {
      case AnchoringStatus.ANCHORED:
        return {
          id: this.request.id.toString(),
          status: this.request.status.toString(),
          cid: this.request.cid.toString(),
          docId: this.request.docId,
          createdAt: dateAsTimestamp(this.request.createdAt),
          updatedAt: dateAsTimestamp(this.request.updatedAt),
          anchorRecord: {
            cid: this.anchor.cid.toString(),
            content: {
              path: this.anchor.path,
              prev: this.request.cid.toString(),
              proof: this.anchor.proofCid.toString(),
            },
          },
        };
      case AnchoringStatus.PENDING:
        return {
          id: this.request.id.toString(),
          status: this.request.status.toString(),
          cid: this.request.cid.toString(),
          docId: this.request.docId,
          createdAt: dateAsTimestamp(this.request.createdAt),
          updatedAt: dateAsTimestamp(this.request.updatedAt),
          scheduledAt: dateAsTimestamp(this.nextAnchoring),
        };
      case AnchoringStatus.FAILED:
      case AnchoringStatus.NOT_REQUESTED:
      case AnchoringStatus.PROCESSING:
        return {
          id: this.request.id.toString(),
          status: this.request.status.toString(),
          cid: this.request.cid.toString(),
          docId: this.request.docId,
          createdAt: dateAsTimestamp(this.request.createdAt),
          updatedAt: dateAsTimestamp(this.request.updatedAt),
        };
      default:
        throw new UnreachableCaseError(this.request.status);
    }
  }
}

@Injectable()
export class RequestGetScenario {
  constructor(
    private readonly requestStorage: RequestStorage,
    private readonly anchoringSchedule: AnchoringScheduleService,
    private readonly anchorStorage: AnchorStorage,
  ) {}

  async execute(cidString: string) {
    const cid = new CID(cidString);
    const request = await this.requestStorage.byCidOrFail(cid);
    const anchor = await this.anchorStorage.byRequestId(request.id);
    const cronJob = this.anchoringSchedule.get(this.anchoringSchedule.triggerAnchoring);
    const nextAnchoring = cronJob.nextDate().toDate();
    return new RequestPresentation(request, anchor, nextAnchoring);
  }
}
