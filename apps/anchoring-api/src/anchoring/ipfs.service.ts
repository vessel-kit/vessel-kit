import { Injectable } from '@nestjs/common';
import { ConfigService } from '../commons/config.service';
import { Ipfs } from 'ipfs';
import ipfsClient from 'ipfs-http-client';

@Injectable()
export class IpfsService {
  readonly client: Ipfs;

  constructor(configService: ConfigService) {
    this.client = ipfsClient(configService.current.IPFS_URL);
  }
}
