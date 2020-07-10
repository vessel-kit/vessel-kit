import { PathDirection } from './path-direction';

export class MerklePath {
  #steps: PathDirection[];

  constructor(steps: PathDirection[] = []) {
    this.#steps = steps;
  }

  get steps() {
    return this.#steps;
  }

  get last(): PathDirection | undefined {
    return this.#steps[this.#steps.length - 1];
  }

  get isEmpty() {
    return this.#steps.length == 0;
  }

  /**
   * All elements except last.
   */
  get initial(): MerklePath {
    return new MerklePath(this.#steps.slice(0, this.#steps.length - 1));
  }

  append(step: PathDirection) {
    return new MerklePath(this.#steps.concat(step));
  }

  reverse() {
    return new MerklePath(this.#steps.reverse());
  }
}
