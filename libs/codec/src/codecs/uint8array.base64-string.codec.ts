import * as t from 'io-ts';
import * as base64 from '@stablelib/base64';

const coder = new base64.URLSafeCoder('');

export const Uint8ArrayBase64StringCodec = new t.Type<Uint8Array, string, string>(
  'Uint8Array-base64string',
  (u: unknown): u is Uint8Array => u instanceof Uint8Array,
  (u, context) => {
    try {
      const decoded = coder.decode(u);
      return t.success(decoded);
    } catch (e) {
      return t.failure(u, context, e.message);
    }
  },
  (a) => coder.encode(a),
);
