import * as t from 'io-ts';

export const DateTimestampCodec = new t.Type<Date, number, number>(
  'DateTimestamp',
  (input: unknown): input is Date => input instanceof Date,
  (input, context) => {
    try {
      return t.success(new Date(input * 1000));
    } catch (e) {
      t.failure(input, context, 'Invalid timestamp');
    }
  },
  (a: Date) => Math.floor(a.valueOf() / 1000),
);
