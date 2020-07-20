import * as t from 'io-ts';
import { decodeThrow } from './decode-throw';
import { isLeft } from 'fp-ts/lib/Either';
import { PathReporter } from 'io-ts/lib/PathReporter';

export interface ISimpleCodec<A> {
  encode(a: A): any;
  decode(input: unknown): A;
  assertValid(input: unknown): void;
}

export class ValidationError extends Error {
  name = 'ValidationError';
}

export class SimpleCodec<A> implements ISimpleCodec<A> {
  #ttype: t.Type<A, any, unknown>;

  constructor(type: t.Type<A, any, unknown>) {
    this.#ttype = type;
  }

  encode(a: A): any {
    return this.#ttype.encode(a);
  }

  decode(input: unknown): A {
    return decodeThrow(this.#ttype, input);
  }

  assertValid(input: unknown): void {
    const validationResult = this.#ttype.validate(input, []);
    if (isLeft(validationResult)) {
      const message = PathReporter.report(validationResult).join('\n');
      throw new ValidationError(message);
    }
  }
}
