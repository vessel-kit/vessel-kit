import { AlgorithmKind } from "./algorithm-kind";

/**
 * Dummy public key. Can only tell its bytes representation, and what algorithm it belongs to.
 */
export interface IPublicKey {
  readonly alg: AlgorithmKind;
  /**
   * Raw public key in bytes.
   */
  readonly material: Uint8Array;
}

/**
 * Can verify signature created by corresponding [[IPrivateKey]].
 */
export interface ISignatureVerification {
  /**
   * Verify `signature` for `message` input.
   *
   * See implementations for usage examples.
   *
   * @param message Bytes representation of previously signed input.
   * @param signature Bytes representation of signature.
   */
  verify(message: Uint8Array, signature: Uint8Array): Promise<boolean>;
}
