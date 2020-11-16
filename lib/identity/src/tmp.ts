import * as u8a from "uint8arrays";
import IdentityWallet from "identity-wallet";
import CeramicClient from "@ceramicnetwork/ceramic-http-client";
import ThreeIdResolver from "@ceramicnetwork/3id-did-resolver";
import { Resolver } from "did-resolver";
import { DID } from "dids";
import * as jws from "./jose/jws";
// import { Base64urlCodec, decodeThrow } from "@vessel-kit/codec";

// async function main () {
//   const sig = 'nu_cLFIg8Rj_wQ0Le1kf7PqjNeF0XKPck2U5leeKlfA_RhoYv6Fwlv9Qvos2ERCPLWEhVk0SSKv_bHGY97EqhA'
//   const dec = decodeThrow(Base64urlCodec, sig)
//   console.log('Base64urlCodec', dec)
//   const dec2 = u8a.fromString(sig, 'base64url')
//   console.log('dec2', dec2)
// }

async function main() {
  const getPermission = async () => [];
  const seed = u8a.fromString(
    "6e34b2e1a9624113d81ece8a8a22e6e97f0e145c25c1d4d2d0e62753b4060c837097f768559e17ec89ee20cba153b23b9987912ec1e860fa1212ba4b84c776ce",
    "base16"
  );
  const ceramic = new CeramicClient("https://ceramic.3boxlabs.com");
  // const ceramic = new CeramicClient("http://localhost:7007");
  const threeIdResolver = ThreeIdResolver.getResolver(ceramic);
  const resolver = new Resolver({ ...threeIdResolver });
  const idWallet = await IdentityWallet.create({
    seed,
    // @ts-ignore
    ceramic: ceramic,
    getPermission,
  });
  await ceramic.setDIDProvider(idWallet.getDidProvider());
  const did = new DID({ provider: idWallet.getDidProvider(), resolver });
  await did.authenticate();
  const signature = await did.createJWS(
    { obj: "1234" },
    { protected: { alg: "ES256K" } }
  );
  // const preparedSignature =
  //   "eyJraWQiOiJkaWQ6MzpranpsNmN3ZTFqdzE0OWpzYWRiYmpobWoyaXFqYzczbmJtdjE5eXN1dm5jOWxmemFnOW9iam9lb3I4cnN5Y3M_dmVyc2lvbi1pZD1iYWZ5cmVpaGV3NzRoN2lwYjRrNTd0dGxzaW5tenlkeDRkeHIzc3lldnNjMmFrNzJkbXNpajN1cHFueSM2UUYxOGN2WVZjbzhkMkUiLCJhbGciOiJFUzI1NksifQ.eyJvYmoiOiIxMjM0In0.QkNo1k1FO-H6VJVxjBjd1ANptrus5HK3LE-0uKqBXJwF2T1swdhgatDsl9Y8iEUzj2s3kBgPZNEEDwOFe63EHA";
  const result = await jws.verify(signature, resolver);
  console.log("result", result);
  console.log("signature - ", signature);
  console.log('didver', await did.verifyJWS(signature))
  await ceramic.close();
}

main().catch((error) => {
  console.error(error);
});
