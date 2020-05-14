import { RequestRecord } from '../storage/request.record';

export class RequestPresentation {
  readonly id = this.request.id.toString();
  readonly status = this.request.status.toString();
  readonly docId = this.request.docId;
  readonly createdAt = this.request.createdAt.toISOString();
  readonly cid = this.request.cid.toString();

  constructor(private readonly request: RequestRecord) {}

  toJSON() {
    return {
      id: this.id,
      status: this.status,
      docId: this.docId,
      createdAt: this.createdAt,
      cid: this.cid,
    };
  }
}
