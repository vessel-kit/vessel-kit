import { Connection, EntitySubscriberInterface, EventSubscriber, UpdateEvent } from 'typeorm';
import { RequestRecord } from './request.record';
import { Injectable } from '@nestjs/common';
import { PubSubService } from '../commons/pub-sub.service';
import { AnchorStorage } from './anchor.storage';
import { AnchoringStatus } from '@potter/vessel';

@EventSubscriber()
@Injectable()
export class RequestSubscriber implements EntitySubscriberInterface<RequestRecord> {
  constructor(connection: Connection, private readonly pubSubService: PubSubService, private readonly anchorStorage: AnchorStorage) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return RequestRecord;
  }

  async afterUpdate(event: UpdateEvent<RequestRecord>): Promise<any> {
    const record = event.entity;
    if (record.status === AnchoringStatus.ANCHORED) {
      const anchor = await this.anchorStorage.byRequestId(record.id)
      await this.pubSubService.didAnchor.publish({
        id: record.id.toString(),
        status: record.status,
        cid: record.cid.toString(),
        docId: record.docId.toString(),
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
        anchorRecord: {
          cid: anchor.cid.toString(),
          content: {
            path: anchor.path,
            prev: record.cid.toString(),
            proof: anchor.proofCid.toString(),
          },
        },
      });
    }
  }
}
