import { MerkleNode } from './merkle-tree';

class StringNode implements MerkleNode<string> {
  constructor(readonly id: string, readonly left?: StringNode, readonly right?: StringNode) {}

  async merge(other: StringNode): Promise<StringNode> {
    return new StringNode(`Hash(${this} + ${other})`);
  }
}

test('basic leaves', async () => {

});
