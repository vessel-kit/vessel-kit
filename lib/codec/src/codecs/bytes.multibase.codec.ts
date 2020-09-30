import * as t from 'io-ts';
import multibase from 'multibase';

const decoder = new TextDecoder();

/**
 * Codec for Uint8Array ↔ multibase encoded string.
 */
export function BytesMultibaseCodec(base: multibase.name) {
  return new t.Type<Uint8Array, string, string>(
    'Uint8Array-multibase',
    (input: unknown): input is Uint8Array =>
      input instanceof Uint8Array && Boolean(multibase.isEncoded(input as Uint8Array)),
    (input, context) => {
      try {
        const decoded = new Uint8Array(multibase.decode(input));
        return t.success(decoded);
      } catch (e) {
        return t.failure(input, context, e.message);
      }
    },
    (a: Uint8Array) => {
      const encoded = multibase.encode(base, a);
      return decoder.decode(encoded);
    },
  );
}
