import { Module } from '@nestjs/common';
import { CommonsModule } from '../commons/commons.module';
import { RequestCreateScenario } from './request-create.scenario';
import { StorageModule } from '../storage/storage.module';
import { AnchoringModule } from '../anchoring/anchoring.module';
import { RequestGetManyScenario } from './request-get-many.scenario'
import { RequestGetScenario } from './request-get.scenario';

@Module({
  imports: [CommonsModule, StorageModule, AnchoringModule],
  providers: [RequestCreateScenario, RequestGetScenario, RequestGetManyScenario],
  exports: [RequestCreateScenario, RequestGetScenario, RequestGetManyScenario],
})
export class ScenariosModule {}
