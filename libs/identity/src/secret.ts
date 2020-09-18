import * as bytes from '@stablelib/bytes';
import * as ed25519 from '@stablelib/ed25519';
import * as elliptic from 'elliptic';
import { KeyKind } from './key-kind';

const secp256k1Context = new elliptic.ec('secp256k1');

export interface ISecret {
  kind: KeyKind;
  publicKey(): Promise<Uint8Array>
}

export class InvalidKeyMaterialError extends Error {}

export interface ISigningSecret extends ISecret {
  sign(message: Uint8Array): Promise<Uint8Array>;
}

export class Secp256k1Secret implements ISigningSecret {
  readonly kind = KeyKind.secp256k1;
  #keyPair: elliptic.ec.KeyPair;
  #publicKey: Uint8Array;

  constructor(readonly material: Uint8Array) {
    if (material.length !== 32) {
      throw new InvalidKeyMaterialError(`${this.kind} requires 256 bits`);
    }
    this.#keyPair = secp256k1Context.keyFromPrivate(material);
    this.#publicKey = new Uint8Array(this.#keyPair.getPublic().encodeCompressed());
  }

  async publicKey(): Promise<Uint8Array> {
    return this.#publicKey;
  }

  async sign(message: Uint8Array): Promise<Uint8Array> {
    const signature = this.#keyPair.sign(message, { canonical: true });
    const r = new Uint8Array(signature.r.toArray('be', 32));
    const s = new Uint8Array(signature.s.toArray('be', 32));
    return bytes.concat(r, s);
  }
}

export class Ed25519Secret implements ISigningSecret {
  readonly kind = KeyKind.ed25519;
  #keyPair: ed25519.KeyPair;
  #publicKey: Uint8Array;

  constructor(material: Uint8Array) {
    if (material.length !== 32) {
      throw new InvalidKeyMaterialError(`${this.kind} requires 256 bits`);
    }
    this.#keyPair = ed25519.generateKeyPairFromSeed(material as Buffer);
    this.#publicKey = this.#keyPair.publicKey;
  }

  async publicKey(): Promise<Uint8Array> {
    return this.#publicKey;
  }

  async sign(message: Uint8Array): Promise<Uint8Array> {
    return ed25519.sign(this.#keyPair.secretKey, message);
  }
}
