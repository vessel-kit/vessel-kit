import { ConnectionString } from '@vessel-kit/blockchain-connection-string';
import { BlockchainWriter } from './blockchain-writer';
import { IBlockchainWriter } from './blockchain-writer.interface';
import { IAnchoringRequest } from './anchoring-request.interface';
import { ipfsMerge, MerkleTree } from './merkle-tree/merkle-tree';
import { Ipfs } from 'ipfs';
import { BlockchainTransaction } from './blockchain-transaction';
import CID from 'cids';
import { AnchorProofIpldCodec } from './anchor-proof';
import { AnchorLeaf, AnchorLeafIpldCodec } from './anchor-leaf';
import { IAnchoringResponse } from './anchoring-response.interface';

export interface AnchoringCreation<A extends IAnchoringRequest> {
  responses: IAnchoringResponse<A>[];
  transaction: BlockchainTransaction;
}

export class Anchoring {
  #writer: IBlockchainWriter;
  #ipfs: Ipfs;

  constructor(ipfs: Ipfs, connectionString: ConnectionString) {
    this.#writer = BlockchainWriter.fromConnectionString(connectionString);
    this.#ipfs = ipfs;
  }

  async create<A extends IAnchoringRequest>(requests: A[]): Promise<AnchoringCreation<A>> {
    const merkleTree = await this.merkleTree(requests);
    const merkleRoot = new CID(merkleTree.root.id)
    const transaction = await this.#writer.createAnchor(merkleRoot);
    const proofCid = await this.putAnchorProof(transaction, merkleRoot);

    const promises = requests.map<Promise<IAnchoringResponse<A>>>(async (request) => {
      const path = merkleTree.path(request.cid);
      const leaf: AnchorLeaf = {
        prev: new CID(request.cid),
        proof: proofCid,
        path: path,
      };
      const ipld = AnchorLeafIpldCodec.encode(leaf);
      const leafCid = await this.#ipfs.dag.put(ipld);
      return {
        request: request,
        proofCid: proofCid,
        path: path,
        leafCid: leafCid,
      };
    });
    const responses = await Promise.all(promises);
    return {
      responses: responses,
      transaction: transaction,
    };
  }

  putAnchorProof(transaction: BlockchainTransaction, root: CID) {
    const anchorProof = {
      blockNumber: transaction.blockNumber,
      blockTimestamp: transaction.blockTimestamp,
      root: root,
      chainId: transaction.chainId,
      txHash: transaction.cid,
    };
    const ipld = AnchorProofIpldCodec.encode(anchorProof);
    return this.#ipfs.dag.put(ipld);
  }

  async merkleTree(records: IAnchoringRequest[]) {
    const leaves = records.sort((a, b) => a.docId.localeCompare(b.docId)).map((r) => r.cid);
    return MerkleTree.fromLeaves(leaves, ipfsMerge(this.#ipfs));
  }
}
