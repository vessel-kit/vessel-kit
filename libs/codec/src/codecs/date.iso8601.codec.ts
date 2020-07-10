import * as t from 'io-ts';

export const DateISO8601Codec = new t.Type<Date, string, string>(
  'Date-ISO8601',
  (u): u is Date => u instanceof Date,
  (u, c) => {
    const d = new Date(u);
    return isNaN(d.getTime()) ? t.failure(u, c) : t.success(d);
  },
  (a) => a.toISOString(),
);
