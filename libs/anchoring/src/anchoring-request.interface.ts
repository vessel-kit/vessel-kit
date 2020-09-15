import { UuidValue } from './uuid-value';
import { AnchoringStatus } from './anchoring-status';

export interface IAnchoringRequest {
  id: UuidValue;
  status: AnchoringStatus;
  cid: string;
  docId: string;
  createdAt: Date;
  updatedAt: Date;
}
