import { Resolver } from "did-resolver";
import IdentityWallet from "identity-wallet";
import CeramicClient from "@ceramicnetwork/ceramic-http-client";
import { DID } from "dids";
import ThreeIdResolver from "@ceramicnetwork/3id-did-resolver";
import { verify } from "./jose/jws";
const u8a = require("uint8arrays");

const fun = async () => {
  const getPermission = async () => [];
  const seed = u8a.fromString("6e34b2e1a9624113d81ece8a8a22e6e97f0e145c25c1d4d2d0e62753b4060c837097f768559e17ec89ee20cba153b23b9987912ec1e860fa1212ba4b84c776ce", "base16");
  const ceramic = new CeramicClient("https://ceramic.3boxlabs.com");
  const threeIdResolver = ThreeIdResolver.getResolver(ceramic);
  const resolver = new Resolver({...threeIdResolver});
  const idWallet = await IdentityWallet.create({ seed, ceramic: ceramic as any, getPermission});
  await ceramic.setDIDProvider(idWallet.getDidProvider());
  const did = new DID({ provider: idWallet.getDidProvider(), resolver });
  await did.authenticate();
  console.log("signing-probe: initial did - ", did);
  const signature = await did.createJWS({obj: "1234"});
  console.log("signing-probe: signature - ", signature);
  console.log("signing-probe: verify - ", await verify(signature, resolver));
  ceramic.close();
}

fun();
