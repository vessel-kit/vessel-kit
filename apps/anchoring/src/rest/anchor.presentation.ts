import { AnchorRecord } from '../storage/anchor.record';

export class AnchorPresentation {
  readonly id = this.anchor.id.toString();
  readonly requestId = this.anchor.requestId.toString();
  readonly cid = this.anchor.cid.toString();
  readonly createdAt = this.anchor.createdAt.toISOString();

  constructor(private readonly anchor: AnchorRecord) {}

  toJSON() {
    return {
      id: this.id,
      requestId: this.requestId,
      cid: this.cid,
      createdAt: this.createdAt,
    };
  }
}
