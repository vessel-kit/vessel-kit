import { AlgorithmKind } from "./algorithm-kind";
import * as sha256 from "@stablelib/sha256";
import { InvalidAlgorithmKindError } from "./invalid-algorithm-kind.error";
import * as ES256K from "./algorithms/ES256K";
import * as EdDSA from "./algorithms/EdDSA";
import { IPrivateKey } from "./private-key.interface";

const encoder = new TextEncoder();

/**
 * Build instance of {@link IPrivateKey} for one of the supported algorithms.
 */
export class PrivateKeyFactory {
  /**
   * Create ES256K private key.
   *
   * @example
   * ```ts
   * const privateKeyFactory = new PrivateKeyFactory();
   * const privateKey = privateKeyFactory.fromSeed(AlgorithmKind.ES256K, 'seed');
   * ```
   */
  fromSeed(
    kind: AlgorithmKind.ES256K,
    seed: Uint8Array | string
  ): ES256K.PrivateKey;
  /**
   * Create EdDSA private key.
   *
   * @example
   * ```ts
   * const privateKeyFactory = new PrivateKeyFactory();
   * const privateKey = privateKeyFactory.fromSeed(AlgorithmKind.EdDSA, 'seed');
   * ```
   */
  fromSeed(
    kind: AlgorithmKind.EdDSA,
    seed: Uint8Array | string
  ): EdDSA.PrivateKey;
  fromSeed(kind: AlgorithmKind, seed: Uint8Array | string): IPrivateKey {
    const bytes = typeof seed === "string" ? encoder.encode(seed) : seed;
    const material = sha256.hash(bytes);
    switch (kind) {
      case AlgorithmKind.EdDSA:
        return new EdDSA.PrivateKey(material);
      case AlgorithmKind.ES256K:
        return new ES256K.PrivateKey(material);
      /* istanbul ignore next */
      default:
        throw new InvalidAlgorithmKindError(kind);
    }
  }
}
