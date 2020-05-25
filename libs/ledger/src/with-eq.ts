export interface WithEq<A> {
  equals(other: WithEq<A>): boolean;
}
