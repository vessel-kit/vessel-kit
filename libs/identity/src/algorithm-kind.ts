import { InvalidAlgorithmKindError } from './invalid-algorithm-kind.error';

export enum AlgorithmKind {
  ES256K = 'ES256K',
  EdDSA = 'EdDSA',
}

/* istanbul ignore next */
export namespace AlgorithmKind {
  export function fromString(input: string) {
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
