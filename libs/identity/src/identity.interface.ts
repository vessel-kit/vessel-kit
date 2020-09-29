import { Identifier } from './identifier';

export interface IIdentity {
  did(): Promise<Identifier>;
  sign(message: object): Promise<string>;
}
