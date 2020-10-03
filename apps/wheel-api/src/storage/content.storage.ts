import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ContentRecord } from "./content.record";
import CID from "cids";

@Injectable()
export class ContentStorage {
  constructor(
    @InjectRepository(ContentRecord)
    private repository: Repository<ContentRecord>
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

  async put(cid: string | CID, payload: any) {
    const found = await this.byId(cid);
    if (found) {
      return found;
    } else {
      const contentRecord = new ContentRecord();
      contentRecord.cid = cid.toString();
      contentRecord.payload = payload;
      return this.repository.save(contentRecord);
    }
  }

  save(record: ContentRecord): Promise<ContentRecord> {
    return this.repository.save(record);
  }
}
