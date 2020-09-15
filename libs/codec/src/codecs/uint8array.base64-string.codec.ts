import * as t from 'io-ts';
import multibase from "multibase";
import multicodec from 'multicodec';

const textDecoder = new TextDecoder()

const base64urlPrefix = 'u'

export const Uint8ArrayBase64StringCodec = new t.Type<Uint8Array, string, string>(
  'Uint8Array-base64string',
  (u: unknown): u is Uint8Array => u instanceof Uint8Array,
  (u, context) => {
    try {
      const decoded = multibase.decode(base64urlPrefix + u)
      return t.success(decoded);
    } catch (e) {
      return t.failure(u, context, e.message);
    }
  },
  (a) => {
    const encoded = multibase.encode('base64url', a)
    return textDecoder.decode(multicodec.rmPrefix(encoded))
  },
);
