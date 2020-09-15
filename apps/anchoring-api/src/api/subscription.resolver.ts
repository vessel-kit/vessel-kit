import { Args, Resolver, Subscription } from '@nestjs/graphql';
import { PubSubService } from '../commons/pub-sub.service';

@Resolver()
export class SubscriptionResolver {
  constructor(private readonly pubSubService: PubSubService) {}

  @Subscription('didAnchor', {
    filter: (payload: any, variables: any) => {
      return variables.cid ? payload.didAnchor.cid === variables.cid : true;
    },
  })
  async didAnchor(@Args('cid') cidString: string | undefined) {
    return this.pubSubService.didAnchor.asyncIterator;
  }
}
