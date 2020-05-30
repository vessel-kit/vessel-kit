import { CeramicDocumentId } from './ceramic-document-id';
import { DocumentService } from './document.service';
import { AnchoringStatus } from './anchoring/anchoring-status';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Chain } from './chain';
import { DocumentState } from './document.state';

export class Document {
  #docId: CeramicDocumentId
  #service: DocumentService
  #state$: BehaviorSubject<DocumentState>
  #anchoringSubscription: Subscription

  constructor(docId: CeramicDocumentId, genesisRecord: any & {doctype: string}, documentService: DocumentService) {
    this.#docId = docId
    this.#service = documentService
    this.#state$ = new BehaviorSubject({
      doctype: genesisRecord.doctype,
      current: null,
      freight: genesisRecord,
      anchor: {
        status: AnchoringStatus.NOT_REQUESTED
      },
      log: new Chain([docId.cid])
    })
    this.#anchoringSubscription = this.#service.handleAnchorStatusUpdate(docId, this.#state$)
  }

  get id() {
    return this.#docId
  }

  requestAnchor() {
    this.#service.requestAnchor(this.#docId, this.#docId.cid)
  }

  toJSON() {
    return {
      docId: this.#docId.valueOf(),
      ...this.#state$.value
    }
  }
}
