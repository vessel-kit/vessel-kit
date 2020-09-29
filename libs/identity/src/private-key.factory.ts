import { AlgorithmKind } from './algorithm-kind';
import * as sha256 from '@stablelib/sha256';
import { InvalidAlgorithmKindError } from './invalid-algorithm-kind.error';
import * as secp256k1 from './algorithms/ES256K';
import * as ed25519 from './algorithms/EdDSA';
import { IPrivateKey } from './private-key.interface';

const encoder = new TextEncoder();

export class PrivateKeyFactory {
  fromSeed(kind: AlgorithmKind.ES256K, seed: Uint8Array | string): secp256k1.PrivateKey;
  fromSeed(kind: AlgorithmKind.EdDSA, seed: Uint8Array | string): ed25519.PrivateKey;
  fromSeed(kind: AlgorithmKind, seed: Uint8Array | string): IPrivateKey {
    const bytes = typeof seed === 'string' ? encoder.encode(seed) : seed;
    const material = sha256.hash(bytes);
    switch (kind) {
      case AlgorithmKind.EdDSA:
        return new ed25519.PrivateKey(material);
      case AlgorithmKind.ES256K:
        return new secp256k1.PrivateKey(material);
      /* istanbul ignore next */
      default:
        throw new InvalidAlgorithmKindError(kind);
    }
  }
}
