import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AnchorRecord } from "./anchor.record";
import { TransactionRecord } from "./transaction.record";

@Injectable()
export class TransactionStorage {
  constructor(
    @InjectRepository(TransactionRecord)
    private repository: Repository<TransactionRecord>
  ) {}

  page(index: number, size = 25) {
    return this.repository.find({
      skip: (index - 1) * size,
      take: size,
      order: { createdAt: "DESC" },
    });
  }

  count() {
    return this.repository.count();
  }

  byAnchor(anchor: AnchorRecord) {
    return this.repository.findOne({
      where: {
        id: anchor.transactionId,
      },
    });
  }

  saveAll(records: TransactionRecord[]): Promise<TransactionRecord[]> {
    return this.repository.save(records);
  }

  save(record: TransactionRecord): Promise<TransactionRecord> {
    return this.repository.save(record);
  }
}
