import { FrozenSubject } from '../frozen-subject';
import { DocumentState } from '../document.state';
import { Subscription } from 'rxjs';
import { Doctype, TypedDocument, WithDoctype } from '../doctypes/doctypes';
import { CeramicDocumentId } from '@potter/codec';
import { IDocumentService } from '../document.service.interface';

export class RemoteDocument {
  #id: CeramicDocumentId;
  #state$: FrozenSubject<DocumentState>;
  #remoteUpdateSubscription?: Subscription;
  #service: IDocumentService;

  constructor(state: DocumentState, service: IDocumentService) {
    this.#state$ = new FrozenSubject(state);
    const genesisCid = this.#state$.value.log.first;
    this.#id = new CeramicDocumentId(genesisCid);
    this.#service = service;
  }

  get id(): CeramicDocumentId {
    return this.#id;
  }

  get state() {
    return this.#state$.value;
  }

  get current() {
    return this.state.current || this.state.freight;
  }

  get state$() {
    return this.#state$;
  }

  // TODO When merging with local version, do this on constructor maybe?
  requestUpdates() {
    this.#remoteUpdateSubscription = this.#service.requestUpdates(this.#id, this.state$);
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
    this.#remoteUpdateSubscription.unsubscribe();
  }
}
