import { Module } from '@nestjs/common';
import { CommonsModule } from './commons/commons.module';
import { RestModule } from './rest/rest.module';
import { StorageModule } from './storage/storage.module';
import { AnchoringModule } from './anchoring/anchoring.module';
import { appProviders } from './app.providers';

@Module({
  imports: [...appProviders, CommonsModule, RestModule, StorageModule, AnchoringModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
