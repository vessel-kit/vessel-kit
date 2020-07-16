import { FrozenSubject } from '../frozen-subject';
import { DocumentState } from '../document.state';
import { Subscription } from 'rxjs';
import { Doctype, TypedDocument, WithDoctype } from '../doctypes/doctypes';
import { CeramicDocumentId } from '@potter/codec';
import { IDocumentService } from '../document.service.interface';
import { IDocument } from '../document.interface';
import CID from 'cids';

export class RemoteDocument implements IDocument {
  #id: CeramicDocumentId;
  #state$: FrozenSubject<DocumentState>;
  #external$S: Subscription;
  #service: IDocumentService;

  constructor(state: DocumentState, service: IDocumentService) {
    this.#id = new CeramicDocumentId(state.log.first);
    this.#state$ = new FrozenSubject(state);
    this.#service = service;
    this.#external$S = this.#service.externalUpdates$(this.#id, this.#state$).subscribe(this.state$);
  }

  get id(): CeramicDocumentId {
    return this.#id;
  }

  get head(): CID {
    return this.state.log.last;
  }

  get state(): DocumentState {
    return this.#state$.value;
  }

  get current() {
    return this.state.current || this.state.freight;
  }

  get state$() {
    return this.#state$;
  }

  requestAnchor(): void {
    this.#service.requestAnchor(this.#id, this.state.log.last);
  }

  as<F extends WithDoctype>(doctype: Doctype<F>) {
    if (doctype.name === this.state.doctype) {
      return new TypedDocument(this, doctype, this.#service.context);
    } else {
      throw new Error(`Can not cast ${this.state.doctype} as ${doctype.name}`);
    }
  }

  update(record: any) {
    return this.#service.update(record, this.state$);
  }

  close(): void {
    this.#external$S.unsubscribe();
  }
}
