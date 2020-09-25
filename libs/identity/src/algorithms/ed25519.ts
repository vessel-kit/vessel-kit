import { IPrivateKey } from '../private-key.interface';
import { ISigning } from '../signing.interface';
import { AlgorithmKind } from '../algorithm-kind';
import { IPublicKey } from '../public-key.interface';
import * as ed25519 from '@stablelib/ed25519';

export class PublicKey implements IPublicKey {
  readonly kind = AlgorithmKind.ed25519;
  constructor(readonly material: Uint8Array) {}
}

export class PrivateKey implements IPrivateKey, ISigning {
  readonly kind = AlgorithmKind.ed25519;
  #keyPair: ed25519.KeyPair;
  #publicKey: Uint8Array;

  constructor(material: Uint8Array) {
    this.#keyPair = ed25519.generateKeyPairFromSeed(material as Buffer);
    this.#publicKey = this.#keyPair.publicKey;
  }

  async publicKey(): Promise<PublicKey> {
    return new PublicKey(this.#publicKey);
  }

  async sign(message: Uint8Array): Promise<Uint8Array> {
    return ed25519.sign(this.#keyPair.secretKey, message);
  }
}

export function verifySignature(publicKey: PublicKey, message: Uint8Array, signature: Uint8Array): boolean {
  try {
    return ed25519.verify(publicKey.material, message, signature);
  } catch {
    return false;
  }
}
