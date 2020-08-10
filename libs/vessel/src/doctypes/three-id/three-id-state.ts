import { ThreeIdShape } from './three-id-shape';
import { AnchorState } from '../../document/document.state';

export type ThreeIdState = {
  current: ThreeIdShape | null;
  freight: ThreeIdShape;
  anchor: AnchorState;
};
