import { CeramicDocumentId } from '@potter/codec';
import { Subscription } from 'rxjs';
import { DocumentState } from './document.state';
import { FrozenSubject } from './frozen-subject';
import CID from 'cids';
import { IDocumentService } from './document.service.interface';
import { Doctype, IDocument, TypedDocument, WithDoctype } from './doctypes/doctypes';

export class Document implements IDocument {
  #id: CeramicDocumentId;
  #service: IDocumentService;
  #state$: FrozenSubject<DocumentState>;
  #external$S: Subscription;
  #internal$S: Subscription;

  constructor(state: DocumentState, service: IDocumentService) {
    this.#id = new CeramicDocumentId(state.log.first);
    this.#state$ = new FrozenSubject(state);
    this.#service = service;

    this.#external$S = this.#service.externalUpdates$(this.#id, this.#state$).subscribe(this.state$);
    this.#internal$S = this.state$.subscribe((update) => {
      this.#service.handleUpdate(this.#id, update);
    });
  }

  get id(): CeramicDocumentId {
    return this.#id;
  }

  get head(): CID {
    return this.state.log.last;
  }

  get state() {
    return this.#state$.value;
  }

  get current(): any {
    return this.state.current || this.state.freight;
  }

  get state$(): FrozenSubject<DocumentState> {
    return this.#state$;
  }

  update(record: any): Promise<void> {
    return this.#service.update(record, this.state$);
  }

  requestAnchor(): void {
    this.#service.requestAnchor(this.#id, this.state.log.last);
  }

  as<F extends WithDoctype>(doctype: Doctype<F>): TypedDocument<F> {
    if (doctype.name === this.state.doctype) {
      throw new Error(`NOPE`)
      // return new TypedDocument(this, doctype, this.#service.context);
    } else {
      throw new Error(`Can not cast ${this.state.doctype} as ${doctype.name}`);
    }
  }

  close(): void {
    this.#internal$S.unsubscribe()
    this.#external$S.unsubscribe();
  }

  toJSON(): any {
    return {
      docId: this.#id.valueOf(),
      ...this.#state$.value,
    };
  }
}
