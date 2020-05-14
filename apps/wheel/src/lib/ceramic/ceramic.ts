import { MessageBus } from './message-bus';
import CID from 'cids';
import ipfsClient from 'ipfs-http-client';
import { FileStore } from './file-store';
import { DocumentRepository } from './document.repository';
import { Document } from './document';
import { EthereumAnchorService } from './ethereum-anchor-service';

export class Ceramic {
  constructor(
    private readonly repository: DocumentRepository,
    private readonly anchoringService: EthereumAnchorService,
  ) {}

  static async build(ipfsUrl: string, anchoringUrl: string) {
    const ipfs = ipfsClient(ipfsUrl);
    const bus = await MessageBus.build(ipfs);
    const fileStore = new FileStore(ipfs);
    const repository = new DocumentRepository(bus, fileStore);
    const anchoringService = new EthereumAnchorService(anchoringUrl);
    return new Ceramic(repository, anchoringService);
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
