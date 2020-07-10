import * as t from 'io-ts';
import { isLeft } from 'fp-ts/lib/Either';
import { PathReporter } from 'io-ts/lib/PathReporter';

export class ValidationError extends Error {
  name = 'ValidationError';
}

export async function validatePromise<A, O, I>(codec: t.Type<A, O, I>, input: I): Promise<void> {
  const validationResult = codec.validate(input, []);
  if (isLeft(validationResult)) {
    const message = PathReporter.report(validationResult).join('\n');
    throw new ValidationError(message);
  }
}
