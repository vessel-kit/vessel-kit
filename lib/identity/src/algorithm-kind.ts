import { InvalidAlgorithmKindError } from "./invalid-algorithm-kind.error";

/**
 * Supported [JOSE algorithms](https://www.iana.org/assignments/jose/jose.xhtml#web-signature-encryption-algorithms).
 */
export enum AlgorithmKind {
  /**
   * `secp256k1` signing of `SHA-256` digest as specified in [RFC 8812](https://tools.ietf.org/html/rfc8812).
   */
  ES256K = "ES256K",
  /**
   * `ed25519` signing as specified in [RFC 8037](https://tools.ietf.org/html/rfc8037).
   */
  EdDSA = "EdDSA",
}

/* istanbul ignore next */
export namespace AlgorithmKind {
  /**
   * Convert unknown external `input` to [[AlgorithmKind]].
   */
  export function fromString(input: string): AlgorithmKind {
    const searching = input as AlgorithmKind;
    switch (searching) {
      case AlgorithmKind.EdDSA:
        return AlgorithmKind.EdDSA;
      case AlgorithmKind.ES256K:
        return AlgorithmKind.ES256K;
      default:
        throw new InvalidAlgorithmKindError(searching);
    }
  }
}
