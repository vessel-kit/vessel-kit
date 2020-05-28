import CID from 'cids';
import { DocumentState } from './document.state';
import { MessageBus } from './message-bus';
import { FileStore } from './file-store';
import { Compartment, lockdown } from 'ses';
import { Observable } from 'rxjs';
import { AnchoringStatus } from '@potter/vessel';

export class Document {
  #anchorStatus: AnchoringStatus = AnchoringStatus.NOT_REQUESTED

  constructor(
    readonly cid: CID,
    public state: DocumentState,
    private log: CID[],
    readonly fileStore: FileStore,
    readonly bus: MessageBus,
    private readonly anchoring$: Observable<AnchoringStatus>
  ) {
    this.anchoring$.subscribe(a => {
      console.log(`Updated anchor status for ${cid} to ${a}`)
      this.#anchorStatus = a
    })
  }

  get body() {
    return this.state
  }

  get doctype() {
    return this.state.doctype;
  }

  get docId() {
    return this.cid.toString();
  }

  get anchorStatus() {
    return this.#anchorStatus
  }

  get head() {
    return this.log[this.log.length - 1];
  }

  async update(next: any) {
    // const record = await this.handler.makeRecord(this.state, next);
    if (!this.log) this.log = [];
    const isGoverned = this.state.governance
    if (isGoverned) {
      const governanceDoc = await this.fileStore.get(this.state.governance); // TODO Get better
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
    } else {
      console.log('can not govern')
    }
  }

  async publishHead(): Promise<void> {
    await this.bus.publishHead(this.docId, this.head);
  }
}
