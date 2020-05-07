import IdentityWallet from "identity-wallet";

export const SEED_A =
  "0x5872d6e0ae7347b72c9216db218ebbb9d9d0ae7ab818ead3557e8e78bf944184";
export const SEED_B =
  "0x844194bf788e7e55d3ea18b87aaed0d9b9bb8e21db16922cb74773aee0d67258";

export const IDENTITY_WALLET_A = new IdentityWallet(async () => true, {
  seed: SEED_A
});

export const IDENTITY_WALLET_B = new IdentityWallet(async () => true, {
  seed: SEED_B
});
