import { MessageBus } from './message-bus';
import CID from 'cids';
import ipfsClient from 'ipfs-http-client';
import { FileStore } from './file-store';
import { DocumentRepository } from './document.repository';
import { Document } from './document';
import { EthereumAnchorService } from './ethereum-anchor-service';
import { ContentStorage } from '../../storage/content.storage';
import { DocumentStorage } from '../../storage/document.storage';

// TODO Merge this with anchoring one
export enum RequestStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum RecordType {
  GENESIS = 'GENESIS',
  UPDATE = 'UPDATE',
  ANCHOR = 'ANCHOR'
}


export class Ceramic {
  constructor(
    private readonly repository: DocumentRepository,
    private readonly anchoringService: EthereumAnchorService,
  ) {}

  static async build(
    ipfsUrl: string,
    anchoringUrl: string,
    contentStorage: ContentStorage,
    documentStorage: DocumentStorage,
  ) {
    const ipfs = ipfsClient(ipfsUrl);
    const bus = await MessageBus.build(ipfs);
    const fileStore = new FileStore(ipfs, contentStorage);
    const repository = new DocumentRepository(bus, fileStore, documentStorage);
    const anchoringService = new EthereumAnchorService(anchoringUrl);
    return new Ceramic(repository, anchoringService);
  }

  async stats() {
    return this.repository.stats();
  }

  async create(record: any): Promise<Document> {
    const document = await this.repository.create(record);
    await this.anchoringService.requestAnchor(document.cid);
    return document;
  }

  async load(cid: CID) {
    return this.repository.load(cid);
  }

  async loadMany(cid: CID) {
    return this.anchoringService.listRequest(cid)
  }

  // {docId: string, cid: string, recordStatus: string, time: string}
  async list(): Promise<any>  {
    const documents: any = await this.repository.list()
    return Promise.all(documents.map(doc => {
      return {docId: doc.docId}
    }).map(async doc => {
      let result = doc
      const lastRecord = await this.anchoringService.lastRecord(doc.docId)
      switch (lastRecord.status) {
        case RequestStatus.COMPLETED: {
          const cid = lastRecord.anchorRecord.cid
          const anchoringTime = lastRecord.updatedAt
          const recordType = RecordType.ANCHOR
          result = {
            ...result,
            cid: cid,
            recordType: recordType.toString(),
            time: anchoringTime
          }
        } break;
        case RequestStatus.PENDING: {
          const cid = lastRecord.cid
          const docId = lastRecord.docId
          const scheduledAt = lastRecord.scheduledAt
          let recordType
          if (cid === docId) {
            recordType = RecordType.GENESIS
          } else {
            recordType = RecordType.UPDATE
          }
          result = {
            ...result,
            cid: cid,
            recordType: recordType.toString(),
            time: scheduledAt
          }
        } break;
        case RequestStatus.FAILED:
        case RequestStatus.PROCESSING:
        default: {}
      }
      return result
    }))
  }

  content(cid: CID): Promise<string> {
    return this.repository.content(cid)
  }
}
