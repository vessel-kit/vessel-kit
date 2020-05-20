import { Module } from '@nestjs/common';
import { RestModule } from './rest/rest.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [RestModule, StorageModule],
  providers: [],
})
export class AppModule {}
