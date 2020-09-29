import { IPublicKey } from './public-key.interface';
import { AlgorithmKind } from './algorithm-kind';
import { InvalidAlgorithmKindError } from './invalid-algorithm-kind.error';
import * as ES256K from './algorithms/ES256K';
import * as Ed25519 from './algorithms/Ed25519';

export function verifySignature(publicKey: IPublicKey, message: Uint8Array, signature: Uint8Array): boolean {
  switch (publicKey.kind) {
    case AlgorithmKind.ES256K:
      return ES256K.verifySignature(publicKey, message, signature);
    case AlgorithmKind.Ed25519:
      return Ed25519.verifySignature(publicKey, message, signature);
    default:
      throw new InvalidAlgorithmKindError(publicKey.kind);
  }
}
