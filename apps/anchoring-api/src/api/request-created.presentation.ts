import { RequestRecord } from '../storage/request.record';
import { dateAsTimestamp } from './date-as-timestamp';
import { AnchoringStatus } from '@potter/vessel';

export class RequestCreatedPresentation {
  readonly id: string;
  readonly status: AnchoringStatus;
  readonly cid: string;
  readonly docId: string;
  readonly message: string;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly scheduleAt: number;

  constructor(record: RequestRecord, nextAnchoring: Date) {
    this.id = record.id.toString();
    this.status = record.status;
    this.cid = record.cid.toString();
    this.docId = record.docId;
    this.createdAt = dateAsTimestamp(record.createdAt);
    this.updatedAt = dateAsTimestamp(record.updatedAt);
    this.scheduleAt = dateAsTimestamp(nextAnchoring);
  }
}
