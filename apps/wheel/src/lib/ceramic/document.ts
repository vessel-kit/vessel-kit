import CID from 'cids';
import { IHandler } from './handlers/handler.interface';
import { DocumentState } from './document.state';
import { MessageBus } from './message-bus';
import { FileStore } from './file-store';
import { lockdown, Compartment } from 'ses';

export class Document {
  constructor(
    readonly cid: CID,
    public state: DocumentState,
    private log: CID[],
    readonly fileStore: FileStore,
    readonly bus: MessageBus,
  ) {}

  get body() {
    return this.state;
  }

  get doctype() {
    return this.state.doctype;
  }

  get docId() {
    return this.cid.toString();
  }

  get head() {
    return this.log[this.log.length - 1];
  }

  async update(next: any) {
    // const record = await this.handler.makeRecord(this.state, next);
    if (!this.log) this.log = [];
    const governanceDoc = await this.fileStore.get(this.state.governance['/']); // TODO Get better
    lockdown();
    const compartment = new Compartment({
      module: {},
    });
    const main = compartment.evaluate(governanceDoc.main);
    const canApply = main.canApply

    // const result = canApply()
    const nextContent = Object.assign({}, this.state.content, next.content);
    console.log('content', this.state.content, nextContent)
    const canApplyResult = canApply(this.state.content, nextContent)
    console.log('res', canApplyResult)
    if (canApplyResult) {
      this.state.content = nextContent
      const cid = await this.fileStore.put(next);
      this.log.push(cid);
      await this.publishHead()
    } else {
      console.log('Sorry, can not apply')
    }
  }

  async publishHead(): Promise<void> {
    await this.bus.publishHead(this.docId, this.head);
  }
}
