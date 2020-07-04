import { PathDirection } from './path-direction';

export class MerklePath {
  readonly steps: PathDirection[];
  constructor(steps: PathDirection[] = []) {
    this.steps = steps;
  }

  get last() {
    return this.steps[this.steps.length - 1];
  }

  get initial() {
    return new MerklePath(this.steps.slice(0, this.steps.length - 1));
  }

  append(step: PathDirection) {
    return new MerklePath(this.steps.concat(step));
  }

  reverse() {
    return new MerklePath(this.steps.reverse());
  }
}
