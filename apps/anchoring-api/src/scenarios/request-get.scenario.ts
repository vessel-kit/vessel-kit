import { Injectable } from '@nestjs/common';
import { RequestStorage } from '../storage/request.storage';
import CID from 'cids';
import { RequestRecord } from '../storage/request.record';
import { AnchorStorage } from '../storage/anchor.storage';
import { UnreachableCaseError } from '../unreachable-case.error';
import { AnchorRecord } from '../storage/anchor.record';
import { AnchoringScheduleService } from '../anchoring/anchoring-schedule.service';
import { AnchoringStatus, AnchorResponsePayload } from '@vessel-kit/anchoring';
import { DocId } from '@vessel-kit/codec';

export class RequestPresentation {
  readonly docId = DocId.fromString(this.request.docId);
  constructor(
    private readonly request: RequestRecord,
    private readonly anchor: AnchorRecord | undefined,
    private readonly nextAnchoring: Date,
  ) {}

  toJSON() {
    switch (this.request.status) {
      case AnchoringStatus.ANCHORED:
        return AnchorResponsePayload.encode({
          id: this.request.id.toString(),
          status: this.request.status,
          cid: this.request.cid,
          docId: this.docId,
          createdAt: this.request.createdAt,
          updatedAt: this.request.updatedAt,
          anchorRecord: this.anchor.cid,
        });
      case AnchoringStatus.PROCESSING:
      case AnchoringStatus.PENDING:
        return AnchorResponsePayload.encode({
          id: this.request.id.toString(),
          status: this.request.status,
          cid: this.request.cid,
          docId: this.docId,
          createdAt: this.request.createdAt,
          updatedAt: this.request.updatedAt,
          scheduledAt: this.nextAnchoring,
        });
      case AnchoringStatus.OUTDATED:
      case AnchoringStatus.FAILED:
      case AnchoringStatus.NOT_REQUESTED:
        return AnchorResponsePayload.encode({
          id: this.request.id.toString(),
          status: this.request.status,
          cid: this.request.cid,
          docId: this.docId,
          createdAt: this.request.createdAt,
          updatedAt: this.request.updatedAt,
        });
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

  async execute(cid: CID) {
    const request = await this.requestStorage.byCidOrFail(cid);
    const anchor = await this.anchorStorage.byRequestId(request.id);
    const cronJob = this.anchoringSchedule.get(this.anchoringSchedule.triggerAnchoring);
    const nextAnchoring = cronJob.nextDate().toDate();
    return new RequestPresentation(request, anchor, nextAnchoring);
  }
}
