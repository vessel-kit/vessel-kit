import { InvalidAlgorithmKindError } from './invalid-algorithm-kind.error';

export enum AlgorithmKind {
  ES256K = 'ES256K',
  Ed25519 = 'Ed25519',
}

/* istanbul ignore next */
export namespace AlgorithmKind {
  export function fromString(input: string) {
    const searching = input as AlgorithmKind;
    switch (searching) {
      case AlgorithmKind.Ed25519:
        return AlgorithmKind.Ed25519;
      case AlgorithmKind.ES256K:
        return AlgorithmKind.ES256K;
      default:
        throw new InvalidAlgorithmKindError(searching);
    }
  }
}
