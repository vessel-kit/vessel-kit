import { PublicKey } from './public-key';

export interface State {
  currentState: State
  current
  nextState: State
}

export interface ThreeIdDocumentState {
  owners: PublicKey[],
  publicKeys: Map<string, PublicKey>
}

export class ThreeIdDocument {
  #anchoredState: ThreeIdDocumentState
  #owners: PublicKey[]
  #publicKeys: Map<string, PublicKey>

  constructor(props: ThreeIdDocumentState) {
    this.#owners = props.owners
    this.#publicKeys = props.publicKeys
  }

  get owners() {
    return this.#owners
  }

  get publicKeys() {
    return this.#publicKeys
  }
}
