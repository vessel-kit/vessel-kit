import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import CID from 'cids';
import { DocumentRecord } from './document.record';

@Injectable()
export class DocumentStorage {
  constructor(
    @InjectRepository(DocumentRecord)
    private repository: Repository<DocumentRecord>,
  ) {}

  page(index: number, size = 25) {
    return this.repository.find({
      skip: (index - 1) * size,
      take: size,
    });
  }

  count() {
    return this.repository.count();
  }

  byId(cid: string | CID) {
    return this.repository.findOne({
      where: {
        cid: cid.toString(),
      },
    });
  }

  save(record: DocumentRecord): Promise<DocumentRecord> {
    return this.repository.save(record);
  }
}
