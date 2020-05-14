import { Module } from '@nestjs/common';
import { CommonsModule } from '../commons/commons.module';
import { RequestCreateScenario } from './request-create.scenario';
import { StorageModule } from '../storage/storage.module';
import { AnchoringModule } from '../anchoring/anchoring.module';
import { RequestGetScenario } from './request-get.scenario';

@Module({
  imports: [CommonsModule, StorageModule, AnchoringModule],
  providers: [RequestCreateScenario, RequestGetScenario],
  exports: [RequestCreateScenario, RequestGetScenario],
})
export class ScenariosModule {}
