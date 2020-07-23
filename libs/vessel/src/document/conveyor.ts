import { IWithHistory } from './reducible';
import { IWithDoctype } from './with-doctype.interface';
import { CeramicDocumentId } from '@potter/codec';
import { FrozenSubject } from '../util/frozen-subject';
import { History } from '../util/history';
import { Observable, Subject, Subscription } from 'rxjs';
import { AnchoringService } from '../anchoring.service';
import { Cloud } from '../cloud/cloud';
import { IContext } from '../context';
import { filter } from 'rxjs/operators';

export interface IConveyorService<A extends IWithDoctype & IWithHistory> {
  update$(id: CeramicDocumentId, state$: Observable<A>): Observable<A>;
  handleUpdate(state: A): Promise<void>;
  handleHook(hook: ConveyorHook<A>): Promise<void>;
}

export class RemoteConveyorService<A extends IWithDoctype & IWithHistory> implements IConveyorService<A> {
  constructor(readonly host: string, readonly context: IContext) {}

  handleHook(hook: ConveyorHook<A>): Promise<void> {
    return Promise.resolve(undefined);
  }

  handleUpdate(state: A): Promise<void> {
    return Promise.resolve(undefined);
  }

  update$(id, state$: Observable<A>): Observable<A> {
    return undefined;
  }
}

export class ConveyorService<A extends IWithDoctype & IWithHistory> implements IConveyorService<A> {
  constructor(anchoring: AnchoringService, readonly cloud: Cloud, context: IContext) {}

  handleHook(hook: ConveyorHook<A>): Promise<void> {
    return Promise.resolve(undefined);
  }

  async handleUpdate(state: A): Promise<void> {
    const history = state.log;
    const docId = new CeramicDocumentId(history.first);
    this.cloud.bus.publishHead(docId, history.last);
  }

  update$(id, state$: Observable<A>): Observable<A> {
    return undefined;
  }
}

export enum ConveyorHookKind {
  CREATED,
}

export interface ConveyorCreatedHook<A> {
  kind: ConveyorHookKind.CREATED;
  state: A;
}

export type ConveyorHook<A> = ConveyorCreatedHook<A>;

export class Conveyor<A extends IWithHistory & IWithDoctype> {
  #id: CeramicDocumentId;
  #state$: FrozenSubject<A>;
  #incoming$S: Subscription;
  #hook$: Subject<ConveyorHook<A>>;

  constructor(state: A, service: IConveyorService<A>) {
    this.#id = CeramicDocumentId.fromString(history[0]);
    this.#state$ = new FrozenSubject(state);
    this.#incoming$S = service.update$(this.id, this.state$).subscribe(this.#state$);
    this.state$.pipe(filter((state) => !state.log.first.equals(state.log.last))).subscribe(service.handleUpdate);
    this.#hook$.subscribe(service.handleHook);
  }

  onCreate() {
    this.#hook$.next({ kind: ConveyorHookKind.CREATED, state: this.state });
  }

  get doctype(): string {
    return this.#state$.value.doctype;
  }

  get id(): CeramicDocumentId {
    return this.#id;
  }

  get log(): History {
    return this.#state$.value.log;
  }

  get state(): A {
    return this.#state$.value;
  }

  get state$() {
    return this.#state$.asObservable();
  }

  next(state: A) {
    this.#state$.next(state);
  }

  close() {
    this.#incoming$S.unsubscribe();
    this.#state$.complete();
    this.#hook$.complete();
  }
}
