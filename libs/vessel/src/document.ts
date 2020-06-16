import { CeramicDocumentId } from './ceramic-document-id';
import { DocumentService } from './document.service';
import { AnchoringStatus } from './anchoring/anchoring-status';
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
    })
  }

  get id() {
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

  toJSON() {
    return {
      docId: this.#id.valueOf(),
      ...this.#state$.value
    }
  }

  // TODO
  close() {
    // Unsubscribe from everything
    // Clear named mutex from the service
  }
}
