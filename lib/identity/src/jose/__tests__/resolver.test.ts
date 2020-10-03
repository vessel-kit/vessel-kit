import * as didResolver from "did-resolver";
import { PrivateKeyFactory } from "../../private-key.factory";
import { AlgorithmKind } from "../../algorithm-kind";
import * as keyMethod from "../../key.method";
import {
  extractPublicKeys,
  keyMaterialFromDID,
  publicKeyFromDID,
  UnknownKeyTypeError,
  UnsupportedKeyEncodingError,
  VerificationRelation,
} from "../resolver";
import { DidUrl } from "../../did-url";
import { BytesUnbaseCodec, decodeThrow } from "@vessel-kit/codec";
import * as _ from "lodash";
import * as ES256K from "../../algorithms/ES256K";
import * as Ed25519 from "../../algorithms/EdDSA";

const privateKeyFactory = new PrivateKeyFactory();
const privateKey = privateKeyFactory.fromSeed(AlgorithmKind.ES256K, "seed");

const resolver = new didResolver.Resolver({
  ...keyMethod.getResolver(),
});

describe("extractPublicKeys", () => {
  test("extract by kid", async () => {
    const signer = await keyMethod.SignerIdentified.fromPrivateKey(privateKey);
    const publicKey = await privateKey.publicKey();
    const didDocument = await resolver.resolve(signer.kid);
    const relation = VerificationRelation.authentication;
    const publicKeys = extractPublicKeys(
      didDocument,
      relation,
      signer.kid,
      signer.alg
    );
    expect(publicKeys.length).toEqual(1);
    expect(publicKeys[0]).toEqual(publicKey);
  });

  test("extract by did", async () => {
    const signer = await keyMethod.SignerIdentified.fromPrivateKey(privateKey);
    const publicKey = await privateKey.publicKey();
    const didDocument = await resolver.resolve(signer.kid);
    const relation = VerificationRelation.authentication;
    const didUrl = decodeThrow(DidUrl.asString, signer.kid);
    const publicKeys = extractPublicKeys(
      didDocument,
      relation,
      didUrl.identifier.toString(),
      signer.alg
    );
    expect(publicKeys.length).toEqual(1);
    expect(publicKeys[0]).toEqual(publicKey);
  });

  test("wrong key id", async () => {
    const signer = await keyMethod.SignerIdentified.fromPrivateKey(privateKey);
    const didDocument = await resolver.resolve(signer.kid);
    const relation = VerificationRelation.authentication;
    const kid = decodeThrow(DidUrl.asString, signer.kid);
    const didUrl = new DidUrl(kid.identifier, undefined, undefined, "foo");
    const publicKeys = extractPublicKeys(
      didDocument,
      relation,
      didUrl.toString(),
      signer.alg
    );
    expect(publicKeys.length).toEqual(0);
  });

  test("wrong alg", async () => {
    const signer = await keyMethod.SignerIdentified.fromPrivateKey(privateKey);
    const didDocument = await resolver.resolve(signer.kid);
    const relation = VerificationRelation.authentication;
    const kid = decodeThrow(DidUrl.asString, signer.kid);
    const didUrl = new DidUrl(kid.identifier, undefined, undefined, "foo");
    const publicKeys = extractPublicKeys(
      didDocument,
      relation,
      didUrl.toString(),
      AlgorithmKind.EdDSA
    );
    expect(publicKeys.length).toEqual(0);
  });

  test("no relation entries", async () => {
    const signer = await keyMethod.SignerIdentified.fromPrivateKey(privateKey);
    let didDocument = await resolver.resolve(signer.kid);
    didDocument.authentication = undefined;
    const relation = VerificationRelation.authentication;
    const publicKeys = extractPublicKeys(
      didDocument,
      relation,
      signer.kid,
      signer.alg
    );
    expect(publicKeys.length).toEqual(0);
  });
});

describe("keyMaterialFromDID", () => {
  const seed = "abcdefghijklmnopqrstuvwxyz";
  const textEncoder = new TextEncoder();
  const bytes = textEncoder.encode(seed);
  const publicKeyBase = {
    id: "foo",
    controller: "foo",
    type: "foo",
  };

  test("publicKeyHex", () => {
    const publicKey = Object.assign(
      {
        publicKeyHex: BytesUnbaseCodec("base16").encode(bytes),
      },
      publicKeyBase
    );
    const material = keyMaterialFromDID(publicKey);
    expect(material).toEqual(bytes);
  });
  test("publicKeyBase58", () => {
    const publicKey = Object.assign(
      {
        publicKeyBase58: BytesUnbaseCodec("base58btc").encode(bytes),
      },
      publicKeyBase
    );
    const material = keyMaterialFromDID(publicKey);
    expect(material).toEqual(bytes);
  });
  test("publicKeyBase64", () => {
    const publicKey = Object.assign(
      {
        publicKeyBase64: "foo",
      },
      publicKeyBase
    );
    expect(() => keyMaterialFromDID(publicKey)).toThrow(
      UnsupportedKeyEncodingError
    );
  });
  test("publicKeyPem", () => {
    const publicKey = Object.assign(
      {
        publicKeyPem: "foo",
      },
      publicKeyBase
    );
    expect(() => keyMaterialFromDID(publicKey)).toThrow(
      UnsupportedKeyEncodingError
    );
  });
  test("ethereumAddress", () => {
    const publicKey = Object.assign(
      {
        ethereumAddress: "foo",
      },
      publicKeyBase
    );
    expect(() => keyMaterialFromDID(publicKey)).toThrow(
      UnsupportedKeyEncodingError
    );
  });
  test("publicKeyJwk", () => {
    const publicKey = Object.assign(
      {
        publicKeyJwk: "foo",
      },
      publicKeyBase
    );
    expect(() => keyMaterialFromDID(publicKey)).toThrow(
      UnsupportedKeyEncodingError
    );
  });
});

describe("publicKeyFromDID", () => {
  const material = new Uint8Array(_.times(32));
  const publicKeyBase = {
    id: "foo",
    controller: "foo",
    publicKeyBase58: BytesUnbaseCodec("base58btc").encode(material),
  };

  test("ES256K", () => {
    const types = [
      "Secp256k1VerificationKey2018",
      "EcdsaPublicKeySecp256k1",
      "Secp256k1SignatureVerificationKey2018",
    ];
    types.forEach((type) => {
      const entry = Object.assign({ type }, publicKeyBase);
      const r = publicKeyFromDID(entry);
      expect(r).toBeInstanceOf(ES256K.PublicKey);
    });
  });
  test("Ed25519", () => {
    const types = ["ED25519SignatureVerification"];
    types.forEach((type) => {
      const entry = Object.assign({ type }, publicKeyBase);
      const r = publicKeyFromDID(entry);
      expect(r).toBeInstanceOf(Ed25519.PublicKey);
    });
  });
  test("unknown", () => {
    const entry = Object.assign({ type: "exotic" }, publicKeyBase);
    expect(() => publicKeyFromDID(entry)).toThrow(UnknownKeyTypeError);
  });
});
