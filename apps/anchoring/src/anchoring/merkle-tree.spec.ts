import { MerkleNode } from './merkle-tree';

class StringNode extends MerkleNode<string> {
  constructor(readonly id: string, readonly left?: StringNode, readonly right?: StringNode) {
    super(id, left, right)
  }

  async merge(other: StringNode): Promise<StringNode> {
    return new StringNode(`Hash(${this} + ${other})`);
  }
}

test('basic leaves', async () => {

});
