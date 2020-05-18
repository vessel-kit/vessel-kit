import { Module } from '@nestjs/common';
import { CommonsModule } from '../commons/commons.module';
import { storageProviders } from './storage.providers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestRecord } from './request.record';
import { RequestStorage } from './request.storage';
import { AnchorRecord } from './anchor.record';
import { AnchorStorage } from './anchor.storage';
import { TransactionStorage } from './transaction.storage';
import { TransactionRecord } from './transaction.record';

@Module({
  imports: [
    ...storageProviders,
    CommonsModule,
    TypeOrmModule.forFeature([RequestRecord, AnchorRecord, TransactionRecord]),
  ],
  providers: [RequestStorage, AnchorStorage, TransactionStorage],
  exports: [RequestStorage, AnchorStorage, TransactionStorage],
})
export class StorageModule {}
