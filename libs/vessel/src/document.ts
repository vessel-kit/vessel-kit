export class Document<State> {
  #state: State

  constructor(init: State) {
    this.#state = init
  }

  get state() {
    return this.#state
  }
}
