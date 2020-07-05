// import { DidPresentation } from "./did.presentation";
// import { ThreeId } from "./three-id";
// import jose from "jose";
//
// test("blank document", () => {
//   const id = "foo";
//   const document = new ThreeId(id);
//   const presentation = new DidPresentation(document);
//   expect(presentation.toJSON()).toEqual({
//     "@context": "https://w3id.org/did/v1",
//     id: `did:3:${id}`
//   });
// });
//
// test("document with keys", () => {
//   const id = "foo";
//   const document = new ThreeId(id);
//   const key = jose.JWK.asKey({
//     kty: "OKP",
//     crv: "Ed25519",
//     x: "VCpo2LMLhn6iWku8MKvSLg2ZAoC-nlOyPVQaO3FxVeQ",
//     kid: "_Qq0UL2Fq651Q0Fjd6TvnYE-faHiOpRlPVQcY_-tA4A"
//   });
//   const keyId = "signing";
//   document.publicKeys.set(keyId, key);
//   const presentation = new DidPresentation(document);
//   expect(presentation.toJSON()).toEqual({
//     "@context": "https://w3id.org/did/v1",
//     id: `did:3:${id}`,
//     publicKey: [
//       {
//         id: `did:3:${id}#${keyId}`,
//         publicKeyJwk: {
//           crv: key.crv,
//           kid: key.kid,
//           kty: key.kty,
//           x: key.x
//         },
//         type: "JwsVerificationKey2020"
//       }
//     ],
//     authentication: [
//       {
//         publicKey: `did:3:${id}#signing`,
//         type: "Secp256k1SignatureAuthentication2018"
//       }
//     ]
//   });
// });
