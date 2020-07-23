import * as t from 'io-ts';
import { isLeft, isRight } from 'fp-ts/lib/Either';
import { PathReporter } from 'io-ts/lib/PathReporter';

export class ValidationError extends Error {
  name = 'ValidationError';
}

export function validateThrow<A, O, I>(codec: t.Type<A, O, I>, value: I) {
  const validationResult = codec.validate(value, []);
  if (isLeft(validationResult)) {
    const message = PathReporter.report(validationResult).join('\n');
    throw new ValidationError(message);
  }
}
