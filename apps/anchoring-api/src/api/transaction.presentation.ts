import { TransactionRecord } from '../storage/transaction.record';

export class TransactionPresentation {
  constructor(private readonly transactionRecord: TransactionRecord) {}

  toJSON() {
    return {
      txHash: this.transactionRecord.txHash,
      id: this.transactionRecord.id.toString(),
      chainId: this.transactionRecord.chainId,
      createdAt: this.transactionRecord.createdAt.toISOString()
    };
  }
}
