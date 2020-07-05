export class MerkleNode<A> {
  private _uplink?: MerkleNode<A>;

  constructor(readonly id: A, readonly left?: MerkleNode<A>, readonly right?: MerkleNode<A>) {
    if (left) {
      left.link(this);
    }
    if (right) {
      right.link(this);
    }
  }

  get uplink() {
    return this._uplink;
  }

  link(node: MerkleNode<A>) {
    this._uplink = node;
  }
}
