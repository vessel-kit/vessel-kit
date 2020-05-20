import { Module } from '@nestjs/common';
import { AnchorController } from './anchor.controller';
import { RequestController } from './request.controller';
import { CommonsModule } from '../commons/commons.module';
import { ScenariosModule } from '../scenarios/scenarios.module';
import { AnchoringModule } from '../anchoring/anchoring.module';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { StorageModule } from '../storage/storage.module';
import { StatsController } from './stats.controller';
import { TransactionController } from './transaction.controller';

@Module({
  imports: [CommonsModule, ScenariosModule, AnchoringModule, TerminusModule, StorageModule],
  controllers: [AnchorController, RequestController, HealthController, StatsController, TransactionController],
})
export class ApiModule {}
