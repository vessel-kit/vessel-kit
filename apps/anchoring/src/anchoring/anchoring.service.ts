import { Injectable } from '@nestjs/common';
import { RequestStorage } from '../storage/request.storage';
import { RequestStatus } from '../storage/request-status';
import { RequestRecord } from '../storage/request.record';
import { IpfsService } from './ipfs.service';
import { MerkleNode, MerkleTree, PathDirection } from './merkle-tree';
import { Ipfs } from 'ipfs';
import CID from 'cids';
import { EthereumService } from './ethereum.service';
import { BlockchainTransaction } from './blockchain-transaction';
import { AnchorRecord } from '../storage/anchor.record';
import { AnchorStorage } from '../storage/anchor.storage';

@Injectable()
export class AnchoringService {
  private readonly ipfs: Ipfs;

  constructor(
    private readonly requestStorage: RequestStorage,
    private readonly anchorStorage: AnchorStorage,
    ipfsService: IpfsService,
    private readonly ethereum: EthereumService,
  ) {
    this.ipfs = ipfsService.client;
  }

  async anchorRequests() {
    const pending = await this.requestStorage.allByStatus(RequestStatus.PENDING);
    const processing = await this.requestStorage.updateStatus(pending, RequestStatus.PROCESSING);
    const [stale, latest] = this.separateRecordsByTime(processing);
    await this.markRecordsFailed(stale);

    if (latest.length === 0) {
      // Nothing to do here
      return;
    }

    const merkleTree = await this.merkleTree(latest);
    const transaction = await this.ethereum.createAnchor(merkleTree.root.id);
    const proofCid = await this.putAnchorProof(transaction, merkleTree.root.id);
    for (const request of latest) {
      const anchorRecord = new AnchorRecord();
      anchorRecord.requestId = request.id;
      anchorRecord.proofCid = proofCid;
      anchorRecord.path = merkleTree.path(request.cid).toString();
      const ipfsAnchorRecord = {
        prev: new CID(request.cid),
        proof: proofCid,
        path: anchorRecord.path,
      };
      anchorRecord.cid = await this.ipfs.dag.put(ipfsAnchorRecord);
      await this.anchorStorage.save(anchorRecord);
      request.status = RequestStatus.COMPLETED;
      await this.requestStorage.save(request); // TODO Subscription for state
    }
  }

  async merkleTree(records: RequestRecord[]) {
    const leaves = records.sort((a, b) => a.docId.localeCompare(b.docId)).map(r => r.cid);
    return MerkleTree.fromLeaves(leaves, async (left, right) => {
      const cid = await this.ipfs.dag.put({
        [PathDirection.L]: left.id,
        [PathDirection.R]: right.id,
      });
      return new MerkleNode(cid, left, right);
    });
  }

  async markRecordsFailed(records: RequestRecord[]) {
    await this.requestStorage.updateStatus(records, RequestStatus.FAILED); // TODO Subscription for states
  }

  putAnchorProof(transaction: BlockchainTransaction, root: CID) {
    const ipfsAnchorProof = {
      blockNumber: transaction.blockNumber,
      blockTimestamp: transaction.blockTimestamp,
      root: root,
      chainId: transaction.chain,
      txHash: transaction.cid,
    };
    return this.ipfs.dag.put(ipfsAnchorProof);
  }

  separateRecordsByTime(records: RequestRecord[]) {
    const latest = new Map<string, RequestRecord>();
    const stale = new Array<RequestRecord>();
    records.forEach(record => {
      const present = latest.get(record.docId);
      if (present) {
        if (record.createdAt > present.createdAt) {
          latest.set(record.docId, record);
          stale.push(present);
        }
      } else {
        latest.set(record.docId, record);
      }
    });
    return [stale, Array.from(latest.values())];
  }
}