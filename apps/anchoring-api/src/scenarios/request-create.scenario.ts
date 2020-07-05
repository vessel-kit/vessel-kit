import CID from 'cids';
import { RequestRecord } from '../storage/request.record';
import { BadRequestException, Injectable } from '@nestjs/common';
import { RequestStorage } from '../storage/request.storage';
import { UuidValue } from '../storage/uuid.value';
import { AnchoringScheduleService } from '../anchoring/anchoring-schedule.service';
import { AnchoringStatus } from '@potter/anchoring';

@Injectable()
export class RequestCreateScenario {
  constructor(
    private readonly requestStorage: RequestStorage,
    private readonly anchoringSchedule: AnchoringScheduleService,
  ) {}

  async execute(cid: CID, docId: string) {
    const record = await this.buildRequestRecord(cid, docId);
    const saved = await this.save(record);
    const cronJob = this.anchoringSchedule.get(this.anchoringSchedule.triggerAnchoring);
    return {
      record: saved,
      nextAnchoring: cronJob.nextDate().toDate(),
    };
  }

  async save(record: RequestRecord) {
    try {
      const found = await this.requestStorage.find(record.cid, record.docId)
      if (found) {
        return found
      } else {
        return await this.requestStorage.save(record);
      }
    } catch (error) {
      const detail = (error as any).detail;
      const message = detail ? detail : error.message;
      throw new BadRequestException(message);
    }
  }

  async buildRequestRecord(cid: CID, docId: string) {
    const record = new RequestRecord();
    record.id = new UuidValue();
    record.cid = cid;
    record.docId = docId;
    record.status = AnchoringStatus.PENDING;
    return record;
  }
}