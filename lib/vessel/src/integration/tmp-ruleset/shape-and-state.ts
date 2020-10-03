import { AnchorState } from "../../document/anchor-state";

export type TwoPartyShape = {
  payload: {
    num: number;
  };
  partyA?: string;
  partyB?: string;
  stage: "draft" | "agreement";
};

export type TwoPartyState = {
  current: TwoPartyShape | null;
  freight: TwoPartyShape;
  anchor: AnchorState;
};
