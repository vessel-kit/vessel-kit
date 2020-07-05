import { UuidValue } from './uuid-value';
import { AnchoringStatus } from './anchoring-status';
import CID from 'cids';

export interface IAnchoringRequest {
  id: UuidValue;
  status: AnchoringStatus;
  cid: CID;
  docId: string;
  createdAt: Date;
  updatedAt: Date;
}
