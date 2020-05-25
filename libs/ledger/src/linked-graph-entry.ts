// Note: No constraints on what pointer is, and how it relates to payload
export class LinkedGraphEntry<A, Pointer> {
  readonly #payload: A;
  readonly #pointer: Pointer;
  readonly #prev: Pointer | null;
  readonly #next: Pointer[];

  constructor(payload: A, pointer: Pointer, prev?: Pointer, next?: Pointer[]) {
    this.#payload = payload
    this.#prev = prev
    this.#next = next || []
    this.#pointer = pointer
  }

  get pointer() {
    return this.#pointer
  }

  get payload() {
    return this.#payload
  }

  get next() {
    return this.#next
  }

  get prev() {
    return this.#prev
  }

  addNext(pointer: Pointer) {
    const nextNext = this.next.concat(pointer)
    return new LinkedGraphEntry(this.payload, this.pointer, this.prev, nextNext)
  }
}
