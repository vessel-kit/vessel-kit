import CID from 'cids';
import { MerklePath } from './merkle-tree/merkle-path';
import { IAnchoringRequest } from './anchoring-request.interface';

export interface IAnchoringResponse<A extends IAnchoringRequest> {
  request: A
  proofCid: CID,
  path: MerklePath,
  leafCid: CID
}
