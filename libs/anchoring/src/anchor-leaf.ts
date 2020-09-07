import CID from 'cids';
import { MerklePath } from './merkle-tree/merkle-path';
import * as t from 'io-ts'
import { CidIpldCodec } from '@vessel-kit/codec';
import { MerklePathStringCodec } from './merkle-tree/merkle-path.string.codec';

export interface AnchorLeaf {
  prev: CID,
  proof: CID,
  path: MerklePath,
}

interface AnchorLeafIpld {
  prev: CID,
  proof: CID,
  path: string
}

export const AnchorLeafIpldCodec: t.Type<AnchorLeaf, AnchorLeafIpld> = t.type({
  prev: CidIpldCodec,
  proof: CidIpldCodec,
  path: t.string.pipe(MerklePathStringCodec)
})
