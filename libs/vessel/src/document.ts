import { CeramicDocumentId } from '@potter/codec';
import { DocumentService } from './document.service';
import { Subscription } from 'rxjs';
import { DocumentState } from './document.state';
import { FrozenSubject } from './frozen-subject';
import { IDocument } from './document.interface';
import CID from 'cids';

export class Document implements IDocument {
  #id: CeramicDocumentId;
  #service: DocumentService;
  #state$: FrozenSubject<DocumentState>;
  // #anchoringSubscription: Subscription;
  #internal$S: Subscription;
  #external$S: Subscription;

  constructor(state: DocumentState, documentService: DocumentService) {
    this.#id = new CeramicDocumentId(state.log.first);
    this.#state$ = new FrozenSubject(state);
    this.#service = documentService;

    this.#external$S = this.#service.externalUpdates$(this.#id, this.#state$).subscribe(this.state$);
    // this.#anchoringSubscription = this.#service.handleAnchorStatusUpdate(this.#id, this.#state$);
    this.#internal$S = this.state$.subscribe((update) => {
      this.#service.handleUpdate(this.id, update);
    });
  }

  get head(): CID {
    return this.state.log.last;
  }

  get id(): CeramicDocumentId {
    return this.#id;
  }

  get current() {
    return this.state.current || this.state.freight;
  }

  update(record: any) {
    return this.#service.update(record, this.state$);
  }

  get state() {
    return this.#state$.value;
  }

  get state$() {
    return this.#state$;
  }

  requestAnchor(): void {
    this.#service.requestAnchor(this.#id, this.#id.cid);
  }

  // subscribeExternalUpdates() {
  //   this.#service.requestUpdates(this.#id, this.state$);
  // }

  toJSON() {
    return {
      docId: this.#id.valueOf(),
      ...this.#state$.value,
    };
  }
}
