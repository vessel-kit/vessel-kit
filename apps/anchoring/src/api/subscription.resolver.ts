import { Args, Resolver, Subscription } from '@nestjs/graphql';
import { PubSubService } from '../commons/pub-sub.service';

const cids = ['a', 'b'];

@Resolver()
export class SubscriptionResolver {
  constructor(private readonly pubSubService: PubSubService) {
    // setInterval(async () => {
    //   const item = cids[Math.floor(Math.random() * cids.length)];
    //   await this.pubSubService.publish('didAnchor', {
    //     didAnchor: {
    //       id: '10',
    //       status: 'STATUS',
    //       cid: item,
    //       docId: 'DOC_ID',
    //       createdAt: 'created',
    //       updatedAt: 'updated',
    //       anchorRecord: {
    //         cid: 'cid',
    //         content: {
    //           path: 'FIXME_PATH',
    //           prev: 'FIXME_PREV',
    //           proof: 'FIXME_PROOF',
    //         },
    //       },
    //     },
    //   });
    // }, 1000);
  }

  @Subscription('didAnchor', {
    filter: (payload: any, variables: any) => {
      return variables.cid ? payload.didAnchor.cid === variables.cid : true;
    },
  })
  async didAnchor(@Args('cid') cidString: string | undefined) {
    return this.pubSubService.didAnchor.asyncIterator;
  }
}
