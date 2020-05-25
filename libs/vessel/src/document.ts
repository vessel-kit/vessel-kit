import CID from 'cids';
import { AnchoringState } from './anchoring-state';
import { Chain } from './chain';
import { WithEq } from './with-eq';

export interface Recovered<State, Pointer> {
  pointer: Pointer
  state: State
}

export interface AnchoringProof {
  chainId: string
  blockNumber: number
  blockTimestamp: Date
  txHash: CID
  root: CID
  path: string
}

export interface AnchoredState<State, Pointer> {
  pointer: Pointer
  state: State
  proof: AnchoringProof
}

export class Document<State, Pointer extends WithEq<Pointer>> {
  #current: Recovered<State, Pointer>

  constructor(chain: Chain<State, Pointer>) {

  }
}
