import { IBlockchainReaderHandler } from './blockchain-reader-handler.interface';
import type { Ipfs } from 'ipfs';
import { AnchorProof, AnchorProofIpldCodec } from './anchor-proof';
import { AnchorLeaf, AnchorLeafIpldCodec } from './anchor-leaf';
import { RecordWrap, decodeThrow } from '@vessel-kit/codec';
import CID from 'cids';
import { MerklePathStringCodec } from './merkle-tree/merkle-path.string.codec';
import { ChainID } from 'caip';
import { EthereumReader } from './ethereum/ethereum-reader';
import { ConnectionString } from '@vessel-kit/blockchain-connection-string';

export class MisleadingAnchorError extends Error {
  constructor(record: any) {
    super(`Anchor proof ${record.proof.toString()}, path ${record.path} is misleading`);
  }
}

export class UnhandledChainError extends Error {
  constructor(chain: string) {
    super(`Can not find reader for ${chain}`);
  }
}

function providerFromConnectionString(connectionString: ConnectionString) {
  switch (connectionString.chain) {
    case 'eip155':
      return new EthereumReader(connectionString);
    default:
      throw new UnhandledChainError(connectionString.chain);
  }
}

export interface IBlockchainReader {
  verify(recordWrap: RecordWrap<any>): Promise<AnchorProof>;
}

export class BlockchainReader implements IBlockchainReader {
  #readers: Map<string, IBlockchainReaderHandler>;
  #ipfs: Ipfs;

  constructor(ipfs: Ipfs, readers: Map<string, IBlockchainReaderHandler>) {
    this.#ipfs = ipfs;
    this.#readers = readers;
  }

  static build(ipfs: Ipfs, connectionStrings: ConnectionString[]): IBlockchainReader {
    let readers = new Map<string, IBlockchainReaderHandler>(
      connectionStrings.map((connectionString) => {
        const provider = providerFromConnectionString(connectionString);
        return [connectionString.chain, provider];
      }),
    );
    return new BlockchainReader(ipfs, readers);
  }

  async verify(recordWrap: RecordWrap<any>): Promise<AnchorProof> {
    const anchorLeaf = decodeThrow(AnchorLeafIpldCodec, recordWrap.load);
    const anchorLeafWrap = new RecordWrap<AnchorLeaf>(anchorLeaf, recordWrap.cid);
    await this.verifyPrev(anchorLeafWrap);
    const anchorProofRecord = await this.retrieve(anchorLeaf.proof);
    const anchorProof = decodeThrow(AnchorProofIpldCodec, anchorProofRecord);
    await this.validateChainInclusion(anchorProof);
    return anchorProof;
  }

  async validateChainInclusion(proofRecord: AnchorProof) {
    const chainId = new ChainID(proofRecord.chainId);
    const handler = this.#readers.get(chainId.namespace);
    if (handler) {
      return handler.validateProof(chainId, proofRecord);
    } else {
      throw new UnhandledChainError(chainId.toString());
    }
  }

  async verifyPrev(anchorLeaf: RecordWrap<AnchorLeaf>) {
    const originalRecordCid = await this.originalRecordCid(anchorLeaf);
    if (!originalRecordCid.equals(anchorLeaf.load.prev)) {
      throw new MisleadingAnchorError(anchorLeaf.load);
    }
  }

  async originalRecordCid(anchorRecord: RecordWrap<AnchorLeaf>): Promise<CID> {
    const proofRecord = await this.retrieve(anchorRecord.load.proof);
    if (anchorRecord.load.path && !anchorRecord.load.path.isEmpty) {
      const merklePath = anchorRecord.load.path;
      const queryPath = '/root/' + MerklePathStringCodec.encode(merklePath.initial);
      const record = await this.retrieve(anchorRecord.load.proof, queryPath);
      return record[merklePath.last!];
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
