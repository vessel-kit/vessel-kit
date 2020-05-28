import * as t from 'io-ts';

export const DateStringCodec = new t.Type<Date, string, string>(
  'DateString',
  (u): u is Date => u instanceof Date,
  (u, c) => {
    const d = new Date(u);
    return isNaN(d.getTime()) ? t.failure(u, c) : t.success(d);
  },
  a => a.toISOString(),
);
