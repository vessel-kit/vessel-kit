import * as bytes from '@stablelib/bytes';
import * as elliptic from 'elliptic';
import { IPrivateKey, ISigner } from '../private-key.interface';
import { AlgorithmKind } from '../algorithm-kind';
import { IPublicKey } from '../public-key.interface';
import BN from 'bn.js';

const secp256k1Context = new elliptic.ec('secp256k1');

export class PublicKey implements IPublicKey {
  readonly kind = AlgorithmKind.ES256K;
  constructor(readonly material: Uint8Array) {}
}

export class PrivateKey implements IPrivateKey, ISigner {
  readonly alg = AlgorithmKind.ES256K;

  #keyPair: elliptic.ec.KeyPair;
  #publicKey: Uint8Array;

  constructor(material: Uint8Array) {
    this.#keyPair = secp256k1Context.keyFromPrivate(material);
    this.#publicKey = new Uint8Array(this.#keyPair.getPublic().encodeCompressed());
  }

  async publicKey(): Promise<PublicKey> {
    return new PublicKey(this.#publicKey);
  }

  async sign(message: Uint8Array): Promise<Uint8Array> {
    const signature = this.#keyPair.sign(message, { canonical: true });
    const r = new Uint8Array(signature.r.toArray('be', 32));
    const s = new Uint8Array(signature.s.toArray('be', 32));
    return bytes.concat(r, s);
  }
}

export function verifySignature(publicKey: IPublicKey, message: Uint8Array, signature: Uint8Array): boolean {
  try {
    const keyPair = secp256k1Context.keyFromPublic(publicKey.material);
    const r = new BN(signature.slice(0, 32));
    const s = new BN(signature.slice(32, 64));
    return keyPair.verify(message, { r, s });
  } catch {
    return false;
  }
}
