import { Module } from '@nestjs/common';
import { storageProviders } from './storage.providers';
import { CommonsModule } from '../commons/commons.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentRecord } from './content.record';
import { ContentStorage } from './content.storage';
import { DocumentRecord } from './document.record';
import { DocumentStorage } from './document.storage';

@Module({
  imports: [
    ...storageProviders,
    CommonsModule,
    TypeOrmModule.forFeature([ContentRecord, DocumentRecord]),
  ],
  providers: [ContentStorage, DocumentStorage],
  exports: [ContentStorage, DocumentStorage],
})
export class StorageModule {}
