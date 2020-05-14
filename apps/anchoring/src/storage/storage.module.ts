import { Module } from '@nestjs/common';
import { CommonsModule } from '../commons/commons.module';
import { storageProviders } from './storage.providers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestRecord } from './request.record';
import { RequestStorage } from './request.storage';
import { AnchorRecord } from './anchor.record';
import { AnchorStorage } from './anchor.storage';

@Module({
  imports: [...storageProviders, CommonsModule, TypeOrmModule.forFeature([RequestRecord, AnchorRecord])],
  providers: [RequestStorage, AnchorStorage],
  exports: [RequestStorage, AnchorStorage],
})
export class StorageModule {}
