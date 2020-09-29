import { AlgorithmKind } from './algorithm-kind';
import * as sha256 from '@stablelib/sha256';
import { InvalidAlgorithmKindError } from './invalid-algorithm-kind.error';
import * as secp256k1 from './algorithms/ES256K';
import * as ed25519 from './algorithms/Ed25519';
import { InvalidKeyMaterialError } from './invalid-key-material.error';
import { IPrivateKey } from './private-key.interface';

const encoder = new TextEncoder();

export class PrivateKeyFactory {
  fromSeed(kind: AlgorithmKind.ES256K, seed: Uint8Array | string): secp256k1.PrivateKey;
  fromSeed(kind: AlgorithmKind.Ed25519, seed: Uint8Array | string): ed25519.PrivateKey;
  fromSeed(kind: AlgorithmKind, seed: Uint8Array | string): IPrivateKey {
    const bytes = typeof seed === 'string' ? encoder.encode(seed) : seed;
    const material = sha256.hash(bytes);
    switch (kind) {
      case AlgorithmKind.Ed25519:
        if (material.length !== 32) {
          throw new InvalidKeyMaterialError(`${AlgorithmKind.Ed25519} requires 256 bits`);
        }
        return new ed25519.PrivateKey(material);
      case AlgorithmKind.ES256K:
        if (material.length !== 32) {
          throw new InvalidKeyMaterialError(`${AlgorithmKind.ES256K} requires 256 bits`);
        }
        return new secp256k1.PrivateKey(material);
      default:
        throw new InvalidAlgorithmKindError(kind);
    }
  }
}
