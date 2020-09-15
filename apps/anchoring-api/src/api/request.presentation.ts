import { RequestRecord } from '../storage/request.record';
import { AnchorRecord } from '../storage/anchor.record';
import { ApiProperty } from '@nestjs/swagger';
import { toHexString } from 'multihashes';

export class RequestPresentation {
  @ApiProperty({ example: '3ce7f07f-284e-405e-8833-d05494329d1d', description: 'Anchor ID' })
  readonly id = this.request.id.toString();
  @ApiProperty({ example: 'ANCHORED', description: 'Anchoring request status' })
  readonly status = this.request.status.toString();
  @ApiProperty({
    example: 'vessel://bafyreidygxyu2ohh3cuuj6lwm3hnb6u5ruy43pzc2syc7mztuu5zuemfk4',
    description: 'Vessel Document ID',
  })
  readonly docId = this.request.docId;
  @ApiProperty({ example: '2020-08-21 20:37:17.881', description: 'Anchoring request creation date' })
  readonly createdAt = this.request.createdAt.toISOString();
  @ApiProperty({ example: '2020-08-25 15:33:29.105', description: 'Anchoring request update date' })
  readonly updatedAt = this.request.updatedAt.toISOString();
  @ApiProperty({ example: 'bafyreieoftma6uomy7au4cyptcsndxi7xni5owzax4tetxznt74brpmrdy', description: 'CID' })
  readonly cid = this.request.cid.toString();

  constructor(
    private readonly request: RequestRecord,
    private readonly anchor?: AnchorRecord,
    private readonly root?: Uint8Array,
    private readonly ethereumTxHash?: string,
    private readonly chainId?: string,
  ) {}

  toJSON() {
    const json: any = {
      id: this.id,
      status: this.status,
      docId: this.docId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      cid: this.cid,
    };
    if (this.anchor && this.root) {
      json.anchor = {
        merkleRoot: toHexString(this.root),
        proofCid: this.anchor.proofCid.toString(),
        path: this.anchor.path,
        ethereumTxHash: this.ethereumTxHash,
        chainId: this.chainId,
      };
    }
    return json;
  }
}
