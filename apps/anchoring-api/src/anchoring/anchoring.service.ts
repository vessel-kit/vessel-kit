import { Injectable, Logger } from '@nestjs/common';
import { RequestStorage } from '../storage/request.storage';
import { RequestRecord } from '../storage/request.record';
import { IpfsService } from './ipfs.service';
import { Ipfs } from 'ipfs';
import { AnchorRecord } from '../storage/anchor.record';
import { AnchorStorage } from '../storage/anchor.storage';
import { TransactionStorage } from '../storage/transaction.storage';
import { TransactionRecord } from '../storage/transaction.record';
import { AnchoringStatus } from '@vessel-kit/anchoring';
import { ConfigService } from '../commons/config.service';
import { Anchoring, MerklePathStringCodec } from '@vessel-kit/anchoring';
import { ConnectionString } from '@vessel-kit/blockchain-connection-string';

@Injectable()
export class AnchoringService {
  private readonly logger = new Logger(AnchoringService.name);
  private readonly ipfs: Ipfs;
  private readonly anchoring: Anchoring;

  constructor(
    private readonly configService: ConfigService,
    private readonly requestStorage: RequestStorage,
    private readonly anchorStorage: AnchorStorage,
    ipfsService: IpfsService,
    private readonly transactionStorage: TransactionStorage,
  ) {
    this.ipfs = ipfsService.client;
    const connectionString = ConnectionString.fromString(configService.current.BLOCKCHAIN_URL);
    this.anchoring = new Anchoring(this.ipfs, connectionString);
  }

  async anchorRequests() {
    const pending = await this.requestStorage.allByStatus(AnchoringStatus.PENDING, AnchoringStatus.PROCESSING);
    const processing = await this.requestStorage.updateStatus(pending, AnchoringStatus.PROCESSING);
    const [stale, latest] = this.separateRecordsByTime(processing);
    await this.markRecordsOutdated(stale);

    if (latest.length === 0) {
      this.logger.log(`No pending requests to anchor`);
      return;
    } else {
      this.logger.log(`Requests to anchor: ${latest.length}`);
    }

    const creation = await this.anchoring.create(latest);

    const transactionRecord = new TransactionRecord();
    transactionRecord.blockNumber = creation.transaction.blockNumber;
    transactionRecord.chainId = creation.transaction.chainId.toString();
    transactionRecord.txHash = creation.transaction.txHash;
    transactionRecord.createdAt = new Date(creation.transaction.blockTimestamp * 1000);
    const savedTransactionRecord = await this.transactionStorage.save(transactionRecord);

    for (const response of creation.responses) {
      const anchorRecord = new AnchorRecord();
      anchorRecord.requestId = response.request.id;
      anchorRecord.proofCid = response.proofCid.toString();
      anchorRecord.path = MerklePathStringCodec.encode(response.path);
      anchorRecord.cid = response.leafCid.toString();
      anchorRecord.transactionId = savedTransactionRecord.id;
      await this.anchorStorage.save(anchorRecord);
      response.request.status = AnchoringStatus.ANCHORED;
      await this.requestStorage.save(response.request);
    }
  }

  async markRecordsOutdated(records: RequestRecord[]) {
    await this.requestStorage.updateStatus(records, AnchoringStatus.OUTDATED);
  }

  separateRecordsByTime(records: RequestRecord[]) {
    const latest = new Map<string, RequestRecord>();
    const stale = new Array<RequestRecord>();
    records.forEach((record) => {
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
