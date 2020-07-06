import { IBlockchainReader } from './blockchain-reader.interface';
import { Ipfs } from 'ipfs';
import { AnchorProof, AnchorProofIpldCodec } from './anchor-proof';
import { AnchorLeaf, AnchorLeafIpldCodec } from './anchor-leaf';
import { RecordWrap, decodePromise } from '@potter/codec';
import CID from 'cids';
import { MerklePathStringCodec } from './merkle-tree/merkle-path.string.codec';
import { ChainID } from 'caip';

export class MisleadingAnchorError extends Error {
  constructor(record: any) {
    super(`Anchor proof ${record.proof.toString()}, path ${record.path} is misleading`);
  }
}

export class UnhandledChainIdError extends Error {
  constructor(chainId: ChainID) {
    super(`Can not find reader for ${chainId}`);
  }
}

export class BlockchainReader {
  #readers: IBlockchainReader[];
  #ipfs: Ipfs

  constructor(ipfs: Ipfs, readers: IBlockchainReader[]) {
    this.#ipfs = ipfs
    this.#readers = readers;
  }

  async verify(recordWrap: RecordWrap<any>): Promise<AnchorProof> {
    const anchorLeaf = await decodePromise(AnchorLeafIpldCodec, recordWrap.load);
    const anchorLeafWrap = new RecordWrap<AnchorLeaf>(anchorLeaf, recordWrap.cid);
    await this.verifyPrev(anchorLeafWrap);
    const anchorProofRecord = await this.retrieve(anchorLeaf.proof);
    const anchorProof = await decodePromise(AnchorProofIpldCodec, anchorProofRecord);
    await this.validateChainInclusion(anchorProof);
    return anchorProof
  }

  async validateChainInclusion(proofRecord: AnchorProof) {
    const chainId = new ChainID(proofRecord.chainId);
    const handler = this.#readers.find(handler => handler.canAccept(chainId))
    if (handler) {
      return handler.validateProof(chainId, proofRecord)
    } else {
      throw new UnhandledChainIdError(chainId)
    }
  }

  async verifyPrev(recordWrap: RecordWrap<AnchorLeaf>) {
    const originalRecordCid = await this.originalRecordCid(recordWrap);
    if (!originalRecordCid.equals(recordWrap.load.prev)) {
      throw new MisleadingAnchorError(recordWrap.load);
    }
  }

  async originalRecordCid(anchorRecord: RecordWrap<AnchorLeaf>): Promise<CID> {
    const proofRecord = await this.retrieve(anchorRecord.load.proof);
    if (proofRecord.path) {
      const merklePath = await decodePromise(MerklePathStringCodec, anchorRecord.load.path);
      const queryPath = '/root/' + MerklePathStringCodec.encode(merklePath.initial);
      const record = await this.retrieve(anchorRecord.load.proof, queryPath);
      return record[merklePath.last];
    } else {
      return proofRecord.root;
    }
  }

  async retrieve(cid: CID, path?: string) {
    if (path) {
      const blob = await this.#ipfs.dag.get(cid, path);
      return blob?.value;
    } else {
      const blob = await this.#ipfs.dag.get(cid);
      return blob?.value;
    }
  }
}
