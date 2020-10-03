import * as t from "io-ts";
import multibase from "multibase";
import multicodec from "multicodec";

const textDecoder = new TextDecoder();

/**
 * Codec for Uint8Array ↔ multibase encoded string, without prefix.
 */
export function BytesUnbaseCodec(
  base: multibase.name
): t.Type<Uint8Array, string, string> {
  const prefix = String.fromCharCode(
    multibase.encode(base, new Uint8Array())[0]
  );
  return new t.Type<Uint8Array, string, string>(
    "Uint8Array-unbase",
    (input: unknown): input is Uint8Array =>
      input instanceof Uint8Array &&
      Boolean(multibase.isEncoded(input as Uint8Array)),
    (input, context) => {
      try {
        const decoded = new Uint8Array(multibase.decode(prefix + input));
        return t.success(decoded);
      } catch (e) {
        return t.failure(input, context, e.message);
      }
    },
    (a: Uint8Array) => {
      const encoded = multibase.encode(base, a);
      return textDecoder.decode(multicodec.rmPrefix(encoded));
    }
  );
}
