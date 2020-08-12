import { CeramicDocumentId } from '@potter/codec';
import { Subscription } from 'rxjs';
import { FrozenSubject } from '../util/frozen-subject';
import { IDocumentService } from './document.service.interface';
import { IDocument, Snapshot } from './document.interface';
import { IDoctype } from './doctype';
import { History } from '../util/history';
import debug from 'debug';

const log = debug('vessel:document');

export class Document<State, Shape> implements IDocument<State, Shape> {
  #id: CeramicDocumentId;
  #service: IDocumentService;
  #state$: FrozenSubject<Snapshot<State>>;
  #external$S: Subscription;
  #internal$S: Subscription;
  #handler: IDoctype<State, Shape>;

  constructor(snapshot: Snapshot<State>, handler: IDoctype<State, Shape>, service: IDocumentService) {
    this.#id = new CeramicDocumentId(snapshot.log.first);
    this.#state$ = new FrozenSubject(snapshot);
    this.#service = service;
    this.#handler = handler;

    this.#external$S = this.#service.externalUpdates$(this.#id, this.#handler, this.#state$).subscribe({
      next: (snapshot) => this.state$.next(snapshot),
      error: (error) => log(error),
    });
    this.#internal$S = this.state$.subscribe((update) => {
      this.#service.handleUpdate(this.#id, update);
    });
  }

  get context() {
    return this.#service.context;
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

  get view(): State {
    return this.#state$.value.view;
  }

  async canonical(): Promise<Shape> {
    return this.#handler.canonical(this.state.view);
  }

  get state$(): FrozenSubject<Snapshot<State>> {
    return this.#state$;
  }

  update(record: any): Promise<void> {
    return this.#service.update(record, this.#handler, this.state$);
  }

  requestAnchor(): void {
    this.#service.requestAnchor(this.#id, this.log.last);
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
