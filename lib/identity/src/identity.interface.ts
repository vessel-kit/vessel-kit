import { Identifier } from "./identifier";

/**
 * Dummy identity. Could only tell its DID identifier.
 */
export interface IIdentity {
  /**
   * Current identifier.
   */
  did(): Promise<Identifier>;
}

/**
 * Identity that signs.
 */
export interface IIdentitySigning extends IIdentity {
  /**
   * Sign JSON payload and return compact JWS serialization.
   *
   * @param message JSON payload to sign.
   */
  sign(message: object): Promise<string>;
}
