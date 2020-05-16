import { MessageBus } from './message-bus';
import { FileStore } from './file-store';
import { Doctype, doctypeFromString } from './doctype';
import { DocumentStore } from './document.store';
import { ThreeIdHandler } from './handlers/three-id.handler';
import { HandlerContainer } from './handler-container';
import { Document } from './document';
import CID from 'cids';
import { Ruleset001Handler } from './handlers/ruleset-0.0.1.handler';
import Joi from '@hapi/joi';

const createSchema = Joi.object({
  doctype: Joi.string()
    .allow('vessel/ruleset/0.0.1')
    .required()
    .description('Document type'),
});

export class DocumentRepository {
  private readonly store = new DocumentStore();
  private readonly handlers = new HandlerContainer();

  constructor(
    private readonly messageBus: MessageBus,
    private readonly fileStore: FileStore,
  ) {
    this.handlers = this.handlers
      .set(Doctype.THREE_ID, new ThreeIdHandler())
      .set(Doctype.RULESET_0_0_1, new Ruleset001Handler());
  }

  async stats() {
    const documentsCount = await this.store.count();
    return {
      documentsCount: documentsCount,
    };
  }

  async create(genesisRecord: any): Promise<Document> {
    await createSchema.validateAsync(genesisRecord, { allowUnknown: true });
    const cid = await this.fileStore.put(genesisRecord);
    // Document.load
    const document = new Document(
      cid,
      genesisRecord,
      [],
      this.fileStore,
      this.messageBus,
    );
    this.store.put(document);
    return document;
  }

  async load(cid: CID) {
    const found = this.store.get(cid);
    if (found) {
      return found;
    } else {
      // Retrieve genesis record
      const genesisRecord = await this.fileStore.get(cid);
      // const doctype = doctypeFromString(genesisRecord.doctype);
      // const handler = this.handlers.get(doctype);
      const document = new Document(
        cid,
        genesisRecord,
        [],
        this.fileStore,
        this.messageBus,
      );
      this.store.put(document);
      return document;
    }
  }
}
