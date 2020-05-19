import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { CommonsModule } from '../commons/commons.module';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { ceramicProvider } from './ceramic.provider';
import { StatsController } from './stats.controller';

@Module({
  imports: [CommonsModule, TerminusModule],
  providers: [ceramicProvider],
  controllers: [DocumentController, StatsController, HealthController],
})
export class RestModule {}
