import { AlgorithmKind } from './algorithm-kind';
import { IPublicKey } from './public-key.interface';

export interface IPrivateKey {
  readonly alg: AlgorithmKind;
  publicKey(): Promise<IPublicKey>;
}

export interface ISigner {
  alg: AlgorithmKind;
  sign(message: Uint8Array): Promise<Uint8Array>;
}

export interface ISignerIdentified extends ISigner {
  kid: string;
}
