import * as t from "io-ts";
import { isLeft } from "fp-ts/lib/Either";
import { PathReporter } from "io-ts/lib/PathReporter";

export class DecodeError extends Error {
  name = "DecodeError";
}

export function decodeThrow<A, O, I>(codec: t.Type<A, O, I>, value: I): A {
  const result = codec.decode(value);
  if (isLeft(result)) {
    const message = PathReporter.report(result).join("\n");
    throw new DecodeError(message);
  } else {
    return result.right;
  }
}
