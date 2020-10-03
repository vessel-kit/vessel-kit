import { IPrivateKey, ISigner } from "./private-key.interface";
import { IIdentitySigning } from "./identity.interface";
import { Identifier } from "./identifier";
import * as keyMethod from "./key.method";
import * as jws from "./jose/jws";

/**
 * Instance of [[IIdentity]] built on local private key.
 */
export class KeyIdentity implements IIdentitySigning {
  #privateKey: IPrivateKey & ISigner;

  constructor(privateKey: IPrivateKey & ISigner) {
    this.#privateKey = privateKey;
  }

  async did(): Promise<Identifier> {
    const publicKey = await this.#privateKey.publicKey();
    return keyMethod.identifier(publicKey);
  }

  async sign(message: object): Promise<string> {
    const signer = await keyMethod.SignerIdentified.fromPrivateKey(
      this.#privateKey
    );
    return jws.create(signer, message);
  }
}
