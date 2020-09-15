import { Module } from '@nestjs/common';
import { CommonsModule } from '../commons/commons.module';
import { LiveGateway } from './live.gateway';

@Module({
  imports: [CommonsModule],
  providers: [LiveGateway],
  controllers: [],
})
export class LiveModule {}
