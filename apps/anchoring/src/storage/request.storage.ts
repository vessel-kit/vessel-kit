import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RequestRecord } from './request.record';
import { Repository } from 'typeorm';
import { RequestStatus } from './request-status';
import CID from 'cids';

@Injectable()
export class RequestStorage {
  constructor(@InjectRepository(RequestRecord) private repository: Repository<RequestRecord>) {}

  page(index: number, size = 25) {
    return this.repository.find({
      skip: (index - 1) * size,
      take: size,
      order: { updatedAt: 'DESC', createdAt: 'DESC' },
    });
  }

  count() {
    return this.repository.count();
  }

  countByStatus(status: RequestStatus) {
    return this.repository.count({
      where: {
        status: status,
      },
    });
  }

  byCidOrFail(cid: CID) {
    return this.repository.findOneOrFail({
      where: {
        cid: cid.toString(),
      },
    });
  }

  updateStatus(records: RequestRecord[], status: RequestStatus): Promise<RequestRecord[]> {
    const next = records.map(r => {
      r.status = status;
      return r;
    });
    return this.saveAll(next);
  }

  allByStatus(status: RequestStatus): Promise<RequestRecord[]> {
    return this.repository.find({
      status: status,
    });
  }

  saveAll(records: RequestRecord[]): Promise<RequestRecord[]> {
    return this.repository.save(records);
  }

  save(record: RequestRecord): Promise<RequestRecord> {
    return this.repository.save(record);
  }
}
