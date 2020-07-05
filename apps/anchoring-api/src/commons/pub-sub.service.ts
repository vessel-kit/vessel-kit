import { Injectable } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { PubSubEngine } from 'graphql-subscriptions/dist/pubsub-engine';

@Injectable()
export class PubSubService {
  private readonly pubSub: PubSubEngine;

  constructor() {
    this.pubSub = new PubSub();
  }

  get didAnchor() {
    return {
      publish: (payload: any) => this.publish('didAnchor', { didAnchor: payload }),
      asyncIterator: this.asyncIterator('didAnchor'),
    };
  }

  protected publish(triggerName: string, payload: any) {
    return this.pubSub.publish(triggerName, payload);
  }

  protected asyncIterator<T>(triggers: string | string[]): AsyncIterator<T> {
    return this.pubSub.asyncIterator(triggers);
  }
}
