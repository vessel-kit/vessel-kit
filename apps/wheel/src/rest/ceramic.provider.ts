import { Ceramic } from '../lib/ceramic/ceramic';
import { ConfigService } from '../commons/config.service';
import { ContentStorage } from '../storage/content.storage';
import { DocumentStorage } from '../storage/document.storage';
import { EthereumAnchorService } from '../lib/ceramic/ethereum-anchor-service';

export const ceramicProvider = {
  provide: Ceramic,
  useFactory: async (
    config: ConfigService,
    contentStorage: ContentStorage,
    documentStorage: DocumentStorage,
  ) => {
    const ipfsUrl = config.current.IPFS_URL;
    const anchoringUrl = config.current.ANCHORING_URL;
    return Ceramic.build(
      ipfsUrl,
      anchoringUrl,
      contentStorage,
      documentStorage,
    );
  },
  inject: [ConfigService, ContentStorage, DocumentStorage],
};
