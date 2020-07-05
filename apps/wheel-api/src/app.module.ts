import { Module } from '@nestjs/common';
import { LiveModule } from './live/live.module'
import { RestModule } from './rest/rest.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [RestModule, LiveModule, StorageModule],
  providers: [],
})
export class AppModule {}
