import * as elliptic from 'elliptic';
import * as ed25519 from '@stablelib/ed25519';
import BN from 'bn.js';

const secp256k1Context = new elliptic.ec('secp256k1');

export class SignatureVerification {
  secp256k1(publicKey: Uint8Array, message: Uint8Array, signature: Uint8Array): boolean {
    const keyPair = secp256k1Context.keyFromPublic(publicKey);
    const r = new BN(signature.slice(0, 32));
    const s = new BN(signature.slice(32, 64));
    return keyPair.verify(message, { r, s });
  }

  ed25519(publicKey: Uint8Array, message: Uint8Array, signature: Uint8Array) {
    return ed25519.verify(publicKey, message, signature);
  }
}
