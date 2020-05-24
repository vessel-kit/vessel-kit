import { MessageBus } from './message-bus';
import CID from 'cids';
import ipfsClient from 'ipfs-http-client';
import { FileStore } from './file-store';
import { DocumentRepository } from './document.repository';
import { Document } from './document';
import { EthereumAnchorService } from './ethereum-anchor-service';
import { ContentStorage } from '../../storage/content.storage';
import { DocumentStorage } from '../../storage/document.storage';

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
}
