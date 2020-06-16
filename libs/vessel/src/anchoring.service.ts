import { Observation, RemoteEthereumAnchoringService } from './anchoring/remote-ethereum-anchoring-service';
import { Cloud } from './cloud';
import { CeramicDocumentId } from './ceramic-document-id';
import { Observable } from 'rxjs';
import { ILogger } from './logger/logger.interface';
import CID from 'cids';
import { MerklePath } from './merkle/merkle-path';
import { decode } from "typestub-multihashes";
import * as providers from "@ethersproject/providers"
import * as tPromise from 'io-ts-promise'
import { UnreachableCaseError } from './unreachable-case.error';
import { CHAIN_NAMESPACE, ChainId } from './anchoring/chain-id';

export class MisleadingAnchorError extends Error {
  constructor(record: any) {
    super(`Anchor proof ${record.proof.toString()}, path ${record.path} is misleading`);
  }
}

export class InvalidBlockchainProofError extends Error {
}

export interface ProofRecord {
  root: CID,
  txHash: CID
  chainId: string
  blockNumber: number
  blockTimestamp: number
}

const EthereumNetworks = new Map<string, string>([
  ['1', 'mainnet'],
  ['3', 'ropsten'],
  ['4', 'rinkeby']
])

export class AnchoringService {
  readonly #anchoring: RemoteEthereumAnchoringService
  readonly #cloud: Cloud
  readonly #logger: ILogger

  constructor(logger: ILogger, ethereumEndpoint: string, anchoring: RemoteEthereumAnchoringService, cloud: Cloud) {
    this.#logger = logger.withContext(AnchoringService.name)
    this.#anchoring = anchoring
    this.#cloud = cloud
  }

  async verify(anchorRecord: any, anchorRecordCid: CID): Promise<ProofRecord> {
    this.#logger.debug(`Verifying anchor record ${anchorRecordCid}...`)
    await this.verifyPrev(anchorRecord, anchorRecordCid)
    const proofRecord = await this.#cloud.retrieve(anchorRecord.proof)
    await this.validateChainInclusion(proofRecord)
    this.#logger.debug(`Anchor record ${anchorRecordCid} is verified`)
    return proofRecord as ProofRecord
  }

  async validateChainInclusion(proofRecord: any) {
    const chainId = await tPromise.decode(ChainId.codec, proofRecord.chainId)
    switch (chainId.namespace) {
      case CHAIN_NAMESPACE.ETHEREUM:
        return this.validateEthereumProof(chainId, proofRecord)
      default:
        throw new UnreachableCaseError(chainId.namespace)
    }
  }

  async validateEthereumProof(chainId: ChainId, proofRecord: any) {
    const network = EthereumNetworks.get(chainId.namespace)
    const provider = network ? providers.getDefaultProvider(network) : new providers.JsonRpcProvider()
    const txid = '0x' + decode(proofRecord.txHash.multihash).digest.toString('hex')
    const transaction = await provider.getTransaction(txid);
    const block = await provider.getBlock(transaction.blockHash);
    const txData = Buffer.from(transaction.data.replace('0x', ''), 'hex')
    const root = proofRecord.root.buffer as Buffer
    if (!txData.equals(root)) {
      throw new InvalidBlockchainProofError(`Proof Merkle root ${proofRecord.root} is not in transaction ${txid}`)
    }
    if (proofRecord.blockNumber !== transaction.blockNumber) {
      throw new InvalidBlockchainProofError(`Block numbers diverge: ${proofRecord.blockNumber} in proof vs ${transaction.blockNumber} in tx`)
    }
    if (proofRecord.blockTimestamp !== block.timestamp) {
      throw new InvalidBlockchainProofError(`Block timestamps diverge: ${proofRecord.blockTimestamp} in proof vs ${block.timestamp} in block`)
    }
  }

  async verifyPrev(anchorRecord: any, anchorRecordCid: CID) {
    const originalRecordCid = await this.originalRecordCid(anchorRecord)
    if (!originalRecordCid.equals(anchorRecord.prev)) {
      throw new MisleadingAnchorError(anchorRecord)
    } else {
      this.#logger.debug(`Verified ${anchorRecordCid} if not misleading`)
    }
  }

  async originalRecordCid(anchorRecord: any): Promise<CID> {
    const proofRecord = await this.#cloud.retrieve(anchorRecord.proof)
    if (proofRecord.path) {
      const merklePath = await MerklePath.fromString(anchorRecord.path)
      const queryPath = '/root/' + merklePath.initial.toString()
      const record = await this.#cloud.retrieve(anchorRecord.proof, queryPath)
      return record[merklePath.last]
    } else {
      return proofRecord.root
    }
  }

  anchorStatus$(docId: CeramicDocumentId): Observable<Observation> {
    return this.#anchoring.anchorStatus$(docId)
  }

  requestAnchor(docId: CeramicDocumentId, cid: CID) {
    return this.#anchoring.requestAnchor(docId, cid)
  }
}