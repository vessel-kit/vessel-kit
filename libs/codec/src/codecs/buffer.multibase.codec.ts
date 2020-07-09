import * as t from 'io-ts';
import multibase from 'multibase';

export const BufferMultibaseCodec = new t.Type<Buffer, string, string>(
  'Buffer-multibase',
  (input: unknown): input is Buffer => Buffer.isBuffer(input) && Boolean(multibase.isEncoded(input as Buffer)),
  (input, context) => {
    try {
      return t.success(multibase.decode(input));
    } catch (e) {
      return t.failure(input, context, e.message);
    }
  },
  (a: Buffer) => multibase.encode('base58btc', a).toString(),
);
