import { AlgorithmKind } from './algorithm-kind';
import multicodec from 'multicodec';
import { InvalidAlgorithmKindError } from './invalid-algorithm-kind.error';
import * as t from 'io-ts';
import { IPublicKey } from './public-key.interface';
import * as ES256K from './algorithms/ES256K';
import * as Ed25519 from './algorithms/Ed25519';
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
        return t.success(new ES256K.PublicKey(multicodec.rmPrefix(bytes)));
      case KEY_PREFIX.ed25519:
        return t.success(new Ed25519.PublicKey(multicodec.rmPrefix(bytes)));
      default:
        return t.failure(bytes, context, `Invalid prefix ${prefix}`);
    }
  },
  (publicKey) => {
    switch (publicKey.alg) {
      case AlgorithmKind.ES256K:
        return multicodec.addPrefix(Uint8Array.from([KEY_PREFIX.secp256k1]), publicKey.material);
      case AlgorithmKind.Ed25519:
        return multicodec.addPrefix(Uint8Array.from([KEY_PREFIX.ed25519]), publicKey.material);
      default:
        throw new InvalidAlgorithmKindError(publicKey.alg);
    }
  },
);

export const PublicKeyStringCodec = BytesMultibaseCodec('base58btc').pipe(PublicKeyMulticodecCodec);
