import { Controller, Get, Query } from '@nestjs/common';
import { TransactionStorage } from '../storage/transaction.storage';
import { TransactionPresentation } from './transaction.presentation';

const PAGE_SIZE = 25;

@Controller('/api/v0/transactions')
export class TransactionController {
  constructor(private readonly transactionStorage: TransactionStorage) {}

  @Get('/')
  async index(@Query('page') pageIndex = 1) {
    const transactionRecords = await this.transactionStorage.page(pageIndex, PAGE_SIZE);
    const totalCount = await this.transactionStorage.count();
    return {
      transactions: transactionRecords.map(a => new TransactionPresentation(a)),
      totalCount: totalCount,
      pageSize: PAGE_SIZE,
    };
  }
}
