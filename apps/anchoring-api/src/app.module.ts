import { Module } from '@nestjs/common';
import { CommonsModule } from './commons/commons.module';
import { ApiModule } from './api/api.module';
import { StorageModule } from './storage/storage.module';
import { AnchoringModule } from './anchoring/anchoring.module';
import { appProviders } from './app.providers';

@Module({
  imports: [...appProviders, CommonsModule, ApiModule, StorageModule, AnchoringModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
