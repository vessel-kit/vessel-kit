import { RequestRecord } from '../storage/request.record';
import { AnchorRecord } from '../storage/anchor.record';

export class RequestPresentation {
  readonly id = this.request.id.toString();
  readonly status = this.request.status.toString();
  readonly docId = this.request.docId;
  readonly createdAt = this.request.createdAt.toISOString();
  readonly updatedAt = this.request.updatedAt.toISOString();
  readonly cid = this.request.cid.toString();

  constructor(
    private readonly request: RequestRecord,
    private readonly anchor: AnchorRecord,
    private readonly root: Buffer,
    private readonly ethereumTxHash: string,
    private readonly chainId: string,
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
    if (this.anchor) {
      json.anchor = {
        merkleRoot: this.root.toString('hex'),
        proofCid: this.anchor.proofCid.toString(),
        path: this.anchor.path,
        ethereumTxHash: this.ethereumTxHash,
        chainId: this.chainId,
      };
    }
    return json;
  }
}
