// Note: No constraints on what pointer is, and how it relates to payload
export class ChainEntry<A, Pointer> {
  readonly #payload: A;
  readonly #pointer: Pointer;
  readonly #prev: Pointer | null;

  constructor(payload: A, pointer: Pointer, prev?: Pointer) {
    this.#payload = payload
    this.#prev = prev
    this.#pointer = pointer
  }

  get pointer() {
    return this.#pointer
  }

  get payload() {
    return this.#payload
  }

  get prev() {
    return this.#prev
  }
}
