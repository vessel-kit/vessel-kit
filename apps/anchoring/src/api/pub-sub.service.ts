import { Injectable } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { PubSubEngine } from 'graphql-subscriptions/dist/pubsub-engine';

@Injectable()
export class PubSubService {
  private readonly pubSub: PubSubEngine;

  constructor() {
    this.pubSub = new PubSub();
  }

  async publish(triggerName: string, payload: any): Promise<void> {
    return this.pubSub.publish(triggerName, payload);
  }

  asyncIterator<T>(triggers: string | string[]): AsyncIterator<T> {
    return this.pubSub.asyncIterator(triggers);
  }
}
