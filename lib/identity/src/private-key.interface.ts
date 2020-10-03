import { AlgorithmKind } from "./algorithm-kind";
import { IPublicKey } from "./public-key.interface";

/**
 * Dummy private key. Can only report its supported algorithm and expose its public key.
 * Implementations might be based on _remote_ KMS, like AWS KMS or MetaMask.
 * Public key retrieval could be an asynchronous operation there.
 */
export interface IPrivateKey {
  readonly alg: AlgorithmKind;

  /**
   * Retrieve public key.
   */
  publicKey(): Promise<IPublicKey>;
}

export interface ISigner {
  /**
   * Identifier of realised [JOSE algorithm](https://www.iana.org/assignments/jose/jose.xhtml#web-signature-encryption-algorithms).
   */
  alg: AlgorithmKind;

  /**
   * Sign raw message and return raw signature as defined by the algorithm.
   */
  sign(message: Uint8Array): Promise<Uint8Array>;
}

/**
 * Report key id for the key that actually makes a signature.
 * Here we assume that signer belongs to some DID, thus it could tell us its key identifier.
 */
export interface ISignerIdentified extends ISigner {
  /**
   * Key id as a proper DID URL.
   */
  kid: string;
}
