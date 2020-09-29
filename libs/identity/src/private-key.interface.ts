import { AlgorithmKind } from './algorithm-kind';
import { IPublicKey } from './public-key.interface';

export interface IPrivateKey {
  readonly alg: AlgorithmKind;
  publicKey(): Promise<IPublicKey>;
}
