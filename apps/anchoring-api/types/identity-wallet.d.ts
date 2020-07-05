declare module 'identity-wallet' {
  interface ThreeIdProvider {
    send<A = any>(payload: any): Promise<A>;
  }

  interface IdentityWalletOptions {
    seed: string;
  }

  class IdentityWallet {
    constructor(getConsent: () => Promise<boolean>, opts: IdentityWalletOptions);

    get3idProvider(): ThreeIdProvider;
  }

  export = IdentityWallet;
}

declare module 'identity-wallet/lib/keyring' {
  import { HDNode } from '@ethersproject/hdnode'

  class Keyring {
    _getKeys(space?: string): {
      signingKey: HDNode,
      asymEncryptionKey: {
        publicKey: Buffer,
        secretKey: Buffer
      },
      symEncryptionKey: Buffer,
      managementKey: HDNode
    }
  }

  export = Keyring;
}
