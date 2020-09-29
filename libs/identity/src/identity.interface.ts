import { Identifier } from './identifier';

/**
 * Signing identity
 */
export interface IIdentity {
  did(): Promise<Identifier>;
  sign(message: object): Promise<string>;
}
