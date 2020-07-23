import { CeramicDocumentId } from '@potter/codec';
import { Subscription } from 'rxjs';
import { DocumentState } from './document.state';
import { FrozenSubject } from '../util/frozen-subject';
import { IDocumentService } from './document.service.interface';
import { IWithDoctype } from './with-doctype.interface';
import { IDocument } from './document.interface';
import { TypedDocument } from './typed-document';
import { ITypedDocument } from './typed-document.interface';
import { IDoctype } from './doctype';
import { History } from '../util/history';

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

  get doctype() {
    return this.#state$.value.doctype;
  }

  get id(): CeramicDocumentId {
    return this.#id;
  }

  get log(): History {
    return this.#state$.value.log;
  }

  get state() {
    return this.#state$.value;
  }

  get current(): any {
    const state = this.#state$.value;
    return state.current || state.freight;
  }

  get state$(): FrozenSubject<DocumentState> {
    return this.#state$;
  }

  update(record: any): Promise<void> {
    return this.#service.update(record, this.state$);
  }

  requestAnchor(): void {
    this.#service.requestAnchor(this.#id, this.log.last);
  }

  as<F extends IWithDoctype>(doctype: IDoctype<F>): ITypedDocument<F> {
    if (doctype.name === this.doctype) {
      return new TypedDocument(this, doctype.withContext(this.#service.context));
    } else {
      throw new Error(`Can not cast ${this.doctype} as ${doctype.name}`);
    }
  }

  close(): void {
    this.#internal$S.unsubscribe();
    this.#external$S.unsubscribe();
    this.#state$.complete();
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return this.toJSON();
  }

  toJSON(): any {
    return {
      docId: this.#id.valueOf(),
      ...this.#state$.value,
    };
  }
}
