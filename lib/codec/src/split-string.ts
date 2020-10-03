import * as t from "io-ts";
import { either } from "fp-ts/lib/Either";

export function splitString<A>(separator: string, element: t.Type<A, string>) {
  const array = t.array(element);
  const validate = (input: string, context: t.Context) =>
    either.chain(t.string.validate(input, context), (s) => {
      const parts = s ? s.split(separator) : [];
      return array.validate(parts, context);
    });
  return new t.Type<A[], string, string>(
    "SplitString",
    array.is,
    validate,
    (a) => a.join(separator)
  );
}
