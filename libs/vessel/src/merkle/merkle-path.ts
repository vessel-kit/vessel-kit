import { PathDirection, PathDirectionCodec } from './path-direction';
import * as t from 'io-ts';
import * as tPromise from 'io-ts-promise';
import * as _ from 'lodash';

const SEPARATOR = '/';

export const SplitCodec = new t.Type<string[], string, string>(
  'SplitCodec',
  (input: unknown): input is string[] => _.isArray(input) && input.every(_.isString),
  input => t.success(input.split(SEPARATOR)),
  (a: string[]) => a.join(SEPARATOR),
);
const MerklePathCodec = t.string.pipe(SplitCodec).pipe(t.array(PathDirectionCodec));

export class MerklePath {
  constructor(readonly steps: PathDirection[] = []) {}

  static async fromString(s: string) {
    const steps = await tPromise.decode(MerklePathCodec, s)
    return new MerklePath(steps)
  }

  get last() {
    return this.steps[this.steps.length - 1]
  }

  get initial() {
    return new MerklePath(this.steps.slice(0, this.steps.length - 1))
  }

  append(step: PathDirection) {
    return new MerklePath(this.steps.concat(step));
  }

  reverse() {
    return new MerklePath(this.steps.reverse());
  }

  toString() {
    return MerklePathCodec.encode(this.steps)
  }
}
