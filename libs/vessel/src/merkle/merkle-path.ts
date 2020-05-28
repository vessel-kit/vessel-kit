export class MerklePath<A> {
  constructor(readonly steps: A[] = []) {}

  append(step: A) {
    return new MerklePath(this.steps.concat(step));
  }

  reverse() {
    return new MerklePath(this.steps.reverse());
  }

  toString() {
    return this.steps.map(s => s.toString()).join('/');
  }
}
