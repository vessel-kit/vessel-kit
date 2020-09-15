import * as t from 'io-ts';
import multibase from 'multibase';

const decoder = new TextDecoder();

export const Uint8ArrayMultibaseCodec = new t.Type<Uint8Array, string, string>(
  'Uint8Array-multibase',
  (input: unknown): input is Uint8Array =>
    input instanceof Uint8Array && Boolean(multibase.isEncoded(input as Uint8Array)),
  (input, context) => {
    try {
      return t.success(multibase.decode(input));
    } catch (e) {
      return t.failure(input, context, e.message);
    }
  },
  (a: Uint8Array) => {
    const base58btc = multibase.encode('base58btc', a);
    return decoder.decode(base58btc);
  },
);
