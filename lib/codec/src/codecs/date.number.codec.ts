import * as t from "io-ts";

export const DateNumberCodec = new t.Type<Date, number, number>(
  "Date-number",
  (input: unknown): input is Date => input instanceof Date,
  (input, context) => {
    try {
      return t.success(new Date(input * 1000));
    } catch (e) {
      return t.failure(input, context, "Invalid timestamp");
    }
  },
  (a: Date) => Math.floor(a.valueOf() / 1000)
);
