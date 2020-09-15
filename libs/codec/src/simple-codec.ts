import * as t from 'io-ts';
import { decodeThrow } from './decode-throw';

export interface ISimpleCodec<A> {
  encode(a: A): any;
  decode(input: unknown): A;
}

export class SimpleCodec<A> implements ISimpleCodec<A> {
  #ttype: t.Type<A, any, unknown>;

  constructor(type: t.Type<A, any, unknown>) {
    this.#ttype = type;
    this.encode = this.encode.bind(this);
    this.decode = this.decode.bind(this);
  }

  encode(a: A): any {
    return this.#ttype.encode(a);
  }

  decode(input: unknown): A {
    return decodeThrow(this.#ttype, input);
  }
}
