import { Ceramic } from '../lib/ceramic/ceramic';
import { ConfigService } from '../commons/config.service';

export const ceramicProvider = {
  provide: Ceramic,
  useFactory: async (config: ConfigService) => {
    const ipfsUrl = config.current.IPFS_URL;
    const anchoringUrl = config.current.ANCHORING_URL;
    return Ceramic.build(ipfsUrl, anchoringUrl);
  },
  inject: [ConfigService],
};
