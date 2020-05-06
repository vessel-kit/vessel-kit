declare module "identity-wallet" {
  export interface ThreeIdProvider {
    send<A = any>(payload: any): Promise<A>;
  }

  export default class IdentityWallet {
    constructor(getConsent: () => Promise<boolean>, opts: any);

    get3idProvider(): ThreeIdProvider;
  }
}
