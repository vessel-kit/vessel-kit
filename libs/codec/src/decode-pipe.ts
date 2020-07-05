import * as t from 'io-ts';
import { decodePromise } from './decode-promise';

export class DecodePipe<A, O> {
  constructor(readonly codec: t.Type<A, O>) {}

  async transform(value: unknown): Promise<A> {
    return decodePromise(this.codec, value);
  }
}
