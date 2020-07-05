import { ChainEntry } from './chain-entry';

export interface ChainStore<A, Pointer> {
  has(pointer: Pointer): Promise<boolean>;
  get(pointer: Pointer): Promise<ChainEntry<A, Pointer>>;
  put(entry: ChainEntry<A, Pointer>): Promise<void>;
}
