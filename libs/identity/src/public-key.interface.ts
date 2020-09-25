import { AlgorithmKind } from './algorithm-kind';

export interface IPublicKey {
  readonly kind: AlgorithmKind;
  readonly material: Uint8Array;
}
