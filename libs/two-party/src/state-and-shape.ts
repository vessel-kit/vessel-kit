import { AnchorState, Signature } from '@vessel-kit/vessel';

export type TwoPartyShape = {
  payload: {
    num: number;
  };
  partyA?: Signature;
  partyB?: Signature;
  stage: 'draft' | 'agreement';
};

export type TwoPartyState = {
  current: TwoPartyShape | null;
  freight: TwoPartyShape;
  anchor: AnchorState;
};