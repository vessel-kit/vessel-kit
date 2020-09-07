import { ConfigService } from '../commons/config.service';
import { Vessel } from '@vessel-kit/vessel';
import ipfsClient from 'ipfs-http-client';
import { ConnectionString } from '@vessel-kit/blockchain-connection-string';

export const vesselProvider = {
  provide: Vessel,
  useFactory: async (config: ConfigService) => {
    const ipfsUrl = config.current.IPFS_URL;
    const anchoringEndpoint = config.current.ANCHORING_URL;
    const ipfs = ipfsClient(ipfsUrl);
    const blockchainUrl = ConnectionString.fromString(
      config.current.BLOCKCHAIN_URL,
    );
    return Vessel.build(ipfs, {
      anchoringEndpoint: anchoringEndpoint,
      blockchainEndpoints: [blockchainUrl],
    });
  },
  inject: [ConfigService],
};
