import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { PubSubService } from './pub-sub.service';

@Module({
  providers: [ConfigService, PubSubService],
  exports: [ConfigService, PubSubService],
})
export class CommonsModule {}
