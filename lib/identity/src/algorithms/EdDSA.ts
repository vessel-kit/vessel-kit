import { IPrivateKey, ISigner } from '../private-key.interface';
import { AlgorithmKind } from '../algorithm-kind';
import { IPublicKey, ISignatureVerification } from '../public-key.interface';
import * as ed25519 from '@stablelib/ed25519';

export class PublicKey implements IPublicKey, ISignatureVerification {
  readonly alg = AlgorithmKind.EdDSA;
  constructor(readonly material: Uint8Array) {}

  async verify(message: Uint8Array, signature: Uint8Array): Promise<boolean> {
    try {
      return ed25519.verify(this.material, message, signature);
    } catch {
      return false;
    }
  }
}

export class PrivateKey implements IPrivateKey, ISigner {
  readonly alg = AlgorithmKind.EdDSA;
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
