import { Injectable } from '@nestjs/common';
import { ConfigService } from '../commons/config.service';
import ipfsClient from 'ipfs-http-client';
import { Ipfs } from 'ipfs';

@Injectable()
export class IpfsService {
  readonly client: Ipfs;

  constructor(private readonly config: ConfigService) {
    const ipfsUrl = config.current.IPFS_URL;
    this.client = ipfsClient(ipfsUrl);
  }
}
