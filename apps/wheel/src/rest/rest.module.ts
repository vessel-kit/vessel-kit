import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { CommonsModule } from '../commons/commons.module';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { ceramicProvider } from './ceramic.provider';
import { StatsController } from './stats.controller';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [CommonsModule, TerminusModule, StorageModule],
  providers: [ceramicProvider],
  controllers: [DocumentController, StatsController, HealthController],
})
export class RestModule {}
