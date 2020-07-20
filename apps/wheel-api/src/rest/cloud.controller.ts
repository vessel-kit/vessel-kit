import { Controller, Get, Param, Query } from '@nestjs/common';
import { CidStringCodec, DecodePipe } from '@potter/codec';
import CID from 'cids';
import { IpfsService } from './ipfs.service';

@Controller('/api/v0/cloud')
export class CloudController {
  constructor(private readonly ipfs: IpfsService) {}

  @Get('/:cid')
  async read(
    @Param('cid', new DecodePipe(CidStringCodec)) cid: CID,
    @Query('path') path?: string,
  ) {
    const blob = await this.ipfs.client.dag.get(cid, path);
    console.log('blob', blob)
    return blob?.value;
  }
}
