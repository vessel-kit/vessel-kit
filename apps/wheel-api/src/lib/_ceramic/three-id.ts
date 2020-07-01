import { JWK } from 'jose';

export class ThreeId {
  #id: string | undefined
  publicKeys: Map<string, JWK.Key>

  constructor(id: string | undefined = undefined, publicKeys: Map<string, JWK.Key> = new Map()) {
    this.#id = id
    this.publicKeys = publicKeys
  }

  get id() {
    return this.#id
  }
}
