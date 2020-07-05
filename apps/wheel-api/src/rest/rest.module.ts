import { Module } from '@nestjs/common';
import { LiveGateway } from '../live/live.gateway'
import { LiveModule } from '../live/live.module'
import { DocumentController } from './document.controller';
import { CommonsModule } from '../commons/commons.module';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { ceramicProvider } from './ceramic.provider';
import { StatsController } from './stats.controller';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [CommonsModule, TerminusModule, StorageModule, LiveModule],
  providers: [ceramicProvider, LiveGateway],
  controllers: [DocumentController, StatsController, HealthController],
})
export class RestModule {}
