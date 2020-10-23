import { TwoPartyShape } from "./two-party-shape";
import { AnchorState } from "@vessel-kit/vessel";

export type TwoPartyState = {
  current: TwoPartyShape | null;
  freight: TwoPartyShape;
  anchor: AnchorState;
};
