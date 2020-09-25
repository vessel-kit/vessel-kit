import { AlgorithmKind } from './algorithm-kind';
import { IPublicKey } from './public-key.interface';

export interface IPrivateKey {
  readonly kind: AlgorithmKind;
  publicKey(): Promise<IPublicKey>;
}
