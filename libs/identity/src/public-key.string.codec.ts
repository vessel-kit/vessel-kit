import { AlgorithmKind } from './algorithm-kind';
import multicodec from 'multicodec';
import { InvalidAlgorithmKindError } from './invalid-algorithm-kind.error';
import * as t from 'io-ts';
import { IPublicKey } from './public-key.interface';
import * as secp256k1 from './algorithms/secp256k1';
import * as ed25519 from './algorithms/ed25519';
import { BytesMultibaseCodec } from '@vessel-kit/codec';

enum KEY_PREFIX {
  secp256k1 = 0xe7,
  ed25519 = 0xec,
}

const PublicKeyMulticodecCodec = new t.Type<IPublicKey, Uint8Array, Uint8Array>(
  'PublicKey-multicodec',
  (p: unknown): p is IPublicKey => {
    if (p && typeof p === 'object') {
      return 'kind' in p && 'material' in p;
    } else {
      return false;
    }
  },
  (bytes, context) => {
    const prefix = multicodec.getCode(bytes);
    switch (prefix) {
      case KEY_PREFIX.secp256k1:
        return t.success(new secp256k1.PublicKey(multicodec.rmPrefix(bytes)));
      case KEY_PREFIX.ed25519:
        return t.success(new ed25519.PublicKey(multicodec.rmPrefix(bytes)));
      default:
        return t.failure(bytes, context, `Invalid prefix ${prefix}`);
    }
  },
  (publicKey) => {
    switch (publicKey.kind) {
      case AlgorithmKind.secp256k1:
        return multicodec.addPrefix(Uint8Array.from([KEY_PREFIX.secp256k1]), publicKey.material);
      case AlgorithmKind.ed25519:
        return multicodec.addPrefix(Uint8Array.from([KEY_PREFIX.ed25519]), publicKey.material);
      default:
        throw new InvalidAlgorithmKindError(publicKey.kind);
    }
  },
);

export const PublicKeyStringCodec = BytesMultibaseCodec('base58btc').pipe(PublicKeyMulticodecCodec);
