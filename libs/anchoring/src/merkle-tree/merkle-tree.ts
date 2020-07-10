import { MerklePath } from './merkle-path';
import { MerkleNode } from './merkle-node';
import { PathDirection } from './path-direction';
import { Ipfs } from 'ipfs';

export interface MergeFn<A> {
  (left: MerkleNode<A>, right: MerkleNode<A>): Promise<MerkleNode<A>>;
}

type Level<A> = MerkleNode<A>[];

async function grow<A>(levels: Level<A>[], mergeFn: MergeFn<A>): Promise<Level<A>[]> {
  const currentLevel = levels[levels.length - 1];
  const isRootReached = currentLevel.length === 1;
  if (isRootReached) {
    return levels;
  } else {
    const nextLevel: Level<A> = [];
    for (let i = 0; i < currentLevel.length - 1; i += 2) {
      const merged = await mergeFn(currentLevel[i], currentLevel[i + 1]);
      nextLevel.push(merged);
    }
    if (currentLevel.length % 2 === 1) {
      // if it's an odd level
      nextLevel.push(currentLevel[currentLevel.length - 1]);
    }
    return grow(levels.concat([nextLevel]), mergeFn);
  }
}

export function ipfsMerge<A>(ipfs: Ipfs) {
  return async function (left: MerkleNode<A>, right: MerkleNode<A>): Promise<MerkleNode<A>> {
    const cid = await ipfs.dag.put({
      [PathDirection.L]: left.id,
      [PathDirection.R]: right.id,
    });
    return new MerkleNode(cid, left, right);
  };
}

/**
 * Unsorted Merkle tree. Sort yourself.
 */
export class MerkleTree<A> {
  constructor(readonly levels: MerkleNode<A>[][]) {}

  static async fromLeaves<A>(leaves: A[], mergeFn: MergeFn<A>) {
    const layer = leaves.map((e) => new MerkleNode(e));
    const levels = await grow([layer], mergeFn);
    return new MerkleTree(levels);
  }

  get root(): MerkleNode<A> {
    return this.levels[this.levels.length - 1][0];
  }

  path(element: A): MerklePath {
    const level = this.levels[0];
    const node = level.find((node) => node.id === element);
    if (node) {
      return this.nodePath(node);
    } else {
      return new MerklePath();
    }
  }

  nodePath(node: MerkleNode<A>, present: MerklePath = new MerklePath()): MerklePath {
    if (node.uplink) {
      const uplink = node.uplink;
      if (uplink.left === node) {
        return this.nodePath(uplink, present.append(PathDirection.L));
      } else if (uplink.right === node) {
        return this.nodePath(uplink, present.append(PathDirection.R));
      } else {
        throw new Error(`Can not find path to ${node} down from ${uplink}`);
      }
    } else {
      return present.reverse();
    }
  }
}
