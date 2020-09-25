import { KeyKind } from './key-kind';
import multicodec from 'multicodec';
import { InvalidSecretKindError } from './invalid-secret-kind.error';
import * as t from 'io-ts';
import { BytesMultibaseCodec } from '@vessel-kit/codec';

enum KEY_PREFIX {
  secp256k1 = 0xe7,
  ed25519 = 0xec,
}

export class PublicKey {
  constructor(readonly kind: KeyKind, readonly material: Uint8Array) {}

  toString() {
    return PublicKeyFingerprintCodec.encode(this);
  }
}

export function publicKeyToMulticodec(publicKey: PublicKey): Uint8Array {
  switch (publicKey.kind) {
    case KeyKind.secp256k1:
      return multicodec.addPrefix(Uint8Array.from([KEY_PREFIX.secp256k1]), publicKey.material);
    case KeyKind.ed25519:
      return multicodec.addPrefix(Uint8Array.from([KEY_PREFIX.ed25519]), publicKey.material);
    default:
      throw new InvalidSecretKindError(publicKey.kind);
  }
}

export const PublicKeyMulticodecCodec = new t.Type<PublicKey, Uint8Array, Uint8Array>(
  'PublicKey-multicodec',
  (p: unknown): p is PublicKey => p instanceof PublicKey,
  (bytes, context) => {
    const prefix = multicodec.getCode(bytes);
    switch (prefix) {
      case KEY_PREFIX.secp256k1:
        return t.success(new PublicKey(KeyKind.secp256k1, multicodec.rmPrefix(bytes)));
      case KEY_PREFIX.ed25519:
        return t.success(new PublicKey(KeyKind.ed25519, multicodec.rmPrefix(bytes)));
      default:
        return t.failure(bytes, context, `Invalid prefix ${prefix}`);
    }
  },
  publicKeyToMulticodec,
);

export const PublicKeyFingerprintCodec = BytesMultibaseCodec('base58btc').pipe(PublicKeyMulticodecCodec);
