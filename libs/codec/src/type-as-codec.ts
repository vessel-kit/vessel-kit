import * as t from 'io-ts';
import { decodeThrow } from './decode-throw';

export interface Codec<A> {
  encode(a: A): any;
  decode(i: unknown): A;
}

export function typeAsCodec<A>(t: t.Type<A, any, unknown>): Codec<A> {
  return {
    encode: t.encode,
    decode(i: unknown): A {
      return decodeThrow(t, i);
    },
  };
}
