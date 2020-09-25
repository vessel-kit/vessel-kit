import { Ed25519Secret, ISecret, Secp256k1Secret } from './secret';
import { KeyKind } from './key-kind';
import * as sha256 from '@stablelib/sha256';
import { InvalidSecretKindError } from "./invalid-secret-kind.error";

const encoder = new TextEncoder();

export class SecretFactory {
  fromSeed(kind: KeyKind.secp256k1, seed: Uint8Array | string): Secp256k1Secret;
  fromSeed(kind: KeyKind.ed25519, seed: Uint8Array | string): Ed25519Secret;
  fromSeed(kind: KeyKind, seed: Uint8Array | string): ISecret {
    const bytes = typeof seed === 'string' ? encoder.encode(seed) : seed;
    const material = sha256.hash(bytes);
    switch (kind) {
      case KeyKind.ed25519:
        return new Ed25519Secret(material);
      case KeyKind.secp256k1:
        return new Secp256k1Secret(material);
      default:
        throw new InvalidSecretKindError(kind);
    }
  }
}
