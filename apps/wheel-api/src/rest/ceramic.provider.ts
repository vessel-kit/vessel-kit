import { ConfigService } from '../commons/config.service';
import { Ceramic } from '@potter/vessel';
import ipfsClient from 'ipfs-http-client';

export const ceramicProvider = {
  provide: Ceramic,
  useFactory: async (config: ConfigService) => {
    const ipfsUrl = config.current.IPFS_URL;
    const anchoringEndpoint = config.current.ANCHORING_URL;
    const ipfs = ipfsClient(ipfsUrl);
    return Ceramic.build(ipfs, {
      anchoringEndpoint: anchoringEndpoint,
    });
  },
  inject: [ConfigService],
};
