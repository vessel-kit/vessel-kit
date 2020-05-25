import { LinkedGraphEntry } from './linked-graph-entry';
import { WithEq } from './with-eq';

type Entries<A, Pointer> = Map<Pointer, LinkedGraphEntry<A, Pointer>>

export class UnknownLinkError<Pointer> extends Error {
  readonly link: Pointer

  constructor(message: string, link: Pointer) {
    super(message);
    this.link = link
  }
}

export class LinkedGraph<A, Pointer extends WithEq<Pointer>> {
  readonly #genesis: Pointer
  #entries: Entries<A, Pointer>
  #tip: Pointer

  constructor(entries: Entries<A, Pointer>, genesis: Pointer, tip: Pointer) {
    this.#genesis = genesis
    this.#tip = tip
    this.#entries = entries
  }

  canAppend(entry: LinkedGraphEntry<A, Pointer>) {
    return this.get(entry.prev)
  }

  append(entry: LinkedGraphEntry<A, Pointer>) {
    const attachment = this.canAppend(entry)
    if (attachment) {
      const updatedAttachment = attachment.addNext(entry.pointer)
      this.#entries.set(attachment.pointer, updatedAttachment)
      const isTipAppend = this.tip.equals(attachment.pointer)
      if (isTipAppend) {
        this.#tip = entry.pointer
      }
    } else {
      throw new UnknownLinkError(`Can not append entry ${entry.pointer}`, entry.prev)
    }
  }

  get(pointer: Pointer) {
    return this.#entries.get(pointer)
  }

  has(pointer: Pointer) {
    return this.#entries.has(pointer)
  }

  get entries() {
    return this.#entries
  }

  get tip() {
    return this.#tip
  }

  get genesis() {
    return this.#genesis
  }
}
