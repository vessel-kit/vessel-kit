import { CeramicDocumentId } from '@potter/codec';
import { DocumentService } from './document.service';
import { AnchoringStatus } from '@potter/anchoring';
import { Subscription } from 'rxjs';
import { Chain } from './chain';
import { DocumentState } from './document.state';
import { FrozenSubject } from './frozen-subject';

export class Document {
  #id: CeramicDocumentId
  #service: DocumentService
  #state$: FrozenSubject<DocumentState>
  #anchoringSubscription: Subscription
  #updateSubscription: Subscription

  constructor(docId: CeramicDocumentId, genesisRecord: any & {doctype: string}, documentService: DocumentService) {
    this.#id = docId
    this.#service = documentService
    this.#state$ = new FrozenSubject({
      doctype: genesisRecord.doctype,
      current: null,
      freight: genesisRecord,
      anchor: {
        status: AnchoringStatus.NOT_REQUESTED
      },
      log: new Chain([docId.cid])
    })
    this.#anchoringSubscription = this.#service.handleAnchorStatusUpdate(docId, this.#state$)
    this.#updateSubscription = this.state$.subscribe(update => {
      this.#service.handleUpdate(this.id, update)
    })
  }

  get head() {
    return this.state.log.last
  }

  get id(): CeramicDocumentId {
    return this.#id
  }

  get current () {
    return this.state.current || this.state.freight
  }

  update(record: any) {
    return this.#service.update(record, this.state$)
  }

  get state() {
    return this.#state$.value
  }

  get state$() {
    return this.#state$
  }

  requestAnchor() {
    this.#service.requestAnchor(this.#id, this.#id.cid)
  }

  requestUpdates() {
    this.#service.requestUpdates(this.#id, this.state$)
  }

  toJSON() {
    return {
      docId: this.#id.valueOf(),
      ...this.#state$.value
    }
  }
}
