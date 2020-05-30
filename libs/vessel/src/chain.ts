// import { ChainEntry } from './chain-entry';
// import { WithEq } from './with-eq';
// import { ChainStore } from './chain-store';
// import { DidAppend, DidTipChanged, ChainEvent } from './chain-event';
// import { Subject } from 'rxjs';
//
// export class UnknownLinkError<Pointer> extends Error {
//   readonly link: Pointer
//
//   constructor(message: string, link: Pointer) {
//     super(message);
//     this.link = link
//   }
// }
//
// export class Chain<A, Pointer extends WithEq<Pointer>> {
//   readonly #genesis: Pointer
//   #tip: Pointer
//   #store: ChainStore<A, Pointer>
//   readonly #events$: Subject<ChainEvent<Pointer>>
//
//   constructor(store: ChainStore<A, Pointer>, genesis: Pointer, tip: Pointer) {
//     this.#genesis = genesis
//     this.#tip = tip
//     this.#store = store
//     this.#events$ = new Subject()
//   }
//
//   async canAppend(entry: ChainEntry<A, Pointer>) {
//     const attachment = await this.get(entry.prev)
//     if (attachment) {
//       return attachment
//     } else {
//       throw new UnknownLinkError(`Can not append entry ${entry.pointer}`, entry.prev)
//     }
//   }
//
//   async append(entry: ChainEntry<A, Pointer>) {
//     const attachment = await this.canAppend(entry)
//     await this.#store.put(attachment)
//     this.notify(new DidAppend(entry.pointer))
//     const isTipAppend = this.tip.equals(attachment.pointer)
//     if (isTipAppend) {
//       const previousTip = this.#tip
//       this.#tip = entry.pointer
//       this.notify(new DidTipChanged(previousTip, this.#tip))
//     }
//   }
//
//   async get(pointer: Pointer): Promise<ChainEntry<A, Pointer>> {
//     return this.#store.get(pointer)
//   }
//
//   async has(pointer: Pointer) {
//     return this.#store.has(pointer)
//   }
//
//   async entries() {
//     throw new Error(`Not implemented errors: LinkedGraph#entries`)
//     // return this.#entries
//   }
//
//   get events$() {
//     return this.#events$.asObservable()
//   }
//
//   get tip() {
//     return this.#tip
//   }
//
//   get genesis() {
//     return this.#genesis
//   }
//
//   protected notify(event: ChainEvent<Pointer>) {
//     this.#events$.next(event)
//   }
// }

import { Cloud } from './cloud';
import { ChainService } from './chain.service';
import { CeramicDocumentId } from './ceramic-document-id';
import CID from 'cids';

export class Chain {
  #log: CID[];
  #set: Set<string>
  #init: CID
  #last: CID

  constructor(log: CID[]) {
    this.#last = log[log.length - 1]
    this.#init = log[0]
    this.#log = log
    this.#set = new Set(log.map(cid => cid.toString()))
  }

  get init() {
    return this.#init
  }

  get last() {
    return this.#last
  }

  get log() {
    return this.#log
  }

  has(cid: CID) {
    return this.#set.has(cid.toString())
  }
}
