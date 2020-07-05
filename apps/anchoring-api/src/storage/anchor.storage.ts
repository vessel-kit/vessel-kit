import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnchorRecord } from './anchor.record';
import { UuidValue } from '@potter/anchoring';

@Injectable()
export class AnchorStorage {
  constructor(@InjectRepository(AnchorRecord) private repository: Repository<AnchorRecord>) {}

  page(index: number, size = 25) {
    return this.repository.find({
      skip: (index - 1) * size,
      take: size,
    });
  }

  count() {
    return this.repository.count()
  }

  byRequestId(id: UuidValue) {
    return this.repository.findOne({
      where: {
        requestId: id.toString()
      }
    })
  }

  saveAll(records: AnchorRecord[]): Promise<AnchorRecord[]> {
    return this.repository.save(records);
  }

  save(record: AnchorRecord): Promise<AnchorRecord> {
    return this.repository.save(record);
  }
}
