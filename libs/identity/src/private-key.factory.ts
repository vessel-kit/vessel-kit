import { AlgorithmKind } from './algorithm-kind';
import * as sha256 from '@stablelib/sha256';
import { InvalidAlgorithmKindError } from './invalid-algorithm-kind.error';
import * as secp256k1 from './algorithms/secp256k1';
import * as ed25519 from './algorithms/ed25519';
import { InvalidKeyMaterialError } from './invalid-key-material.error';
import { IPrivateKey } from './private-key.interface';

const encoder = new TextEncoder();

export class PrivateKeyFactory {
  fromSeed(kind: AlgorithmKind.secp256k1, seed: Uint8Array | string): secp256k1.PrivateKey;
  fromSeed(kind: AlgorithmKind.ed25519, seed: Uint8Array | string): ed25519.PrivateKey;
  fromSeed(kind: AlgorithmKind, seed: Uint8Array | string): IPrivateKey {
    const bytes = typeof seed === 'string' ? encoder.encode(seed) : seed;
    const material = sha256.hash(bytes);
    switch (kind) {
      case AlgorithmKind.ed25519:
        if (material.length !== 32) {
          throw new InvalidKeyMaterialError(`${AlgorithmKind.ed25519} requires 256 bits`);
        }
        return new ed25519.PrivateKey(material);
      case AlgorithmKind.secp256k1:
        if (material.length !== 32) {
          throw new InvalidKeyMaterialError(`${AlgorithmKind.secp256k1} requires 256 bits`);
        }
        return new secp256k1.PrivateKey(material);
      default:
        throw new InvalidAlgorithmKindError(kind);
    }
  }
}
