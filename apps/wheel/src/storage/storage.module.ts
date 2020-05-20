import { Module } from '@nestjs/common';
import { storageProviders } from './storage.providers';
import { CommonsModule } from '../commons/commons.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentRecord } from './content.record';
import { ContentStorage } from './content.storage';

@Module({
  imports: [
    ...storageProviders,
    CommonsModule,
    TypeOrmModule.forFeature([ContentRecord]),
  ],
  providers: [ContentStorage],
  exports: [ContentStorage],
})
export class StorageModule {}
