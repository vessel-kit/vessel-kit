import { Ceramic } from '../lib/ceramic/ceramic';
import { ConfigService } from '../commons/config.service';
import { ContentStorage } from '../storage/content.storage';

export const ceramicProvider = {
  provide: Ceramic,
  useFactory: async (config: ConfigService, contentStorage: ContentStorage) => {
    const ipfsUrl = config.current.IPFS_URL;
    const anchoringUrl = config.current.ANCHORING_URL;
    return Ceramic.build(ipfsUrl, anchoringUrl, contentStorage);
  },
  inject: [ConfigService, ContentStorage],
};
