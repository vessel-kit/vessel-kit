import * as t from 'io-ts';
import multibase from 'multibase';

export const BufferMultibaseCodec = new t.Type<Buffer, string, string>(
  'BufferMultibaseCodec',
  (input: unknown): input is Buffer => Buffer.isBuffer(input) && Boolean(multibase.isEncoded(input as Buffer)),
  input => t.success(multibase.decode(input)),
  (a: Buffer) => multibase.encode('base58btc', a).toString(),
);
