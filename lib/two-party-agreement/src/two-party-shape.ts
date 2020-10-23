export type TwoPartyShape = {
  payload: {
    num: number;
  };
  partyA?: string;
  partyB?: string;
  stage: "draft" | "agreement";
};
