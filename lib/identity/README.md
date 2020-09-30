# VesselKit / Identity

Identity layer for VesselKit.

[DID](https://w3c.github.io/did-core/) provides (amongst others) a way to link private
keys to a self-sovereign identifier. The package provides an opinionated programming model to abstract
over various DID methods to create and verify signatures,
starting with [did:key](https://w3c-ccg.github.io/did-method-key/) method as the most straightforward one.

## Background

VesselKit requires records to be signed. Instead of relying on private keys directly, we employ notion of DID
that abstracts over private keys in a meaningful and interoperable way. This package provides a programming model
for DID-related cryptography functions such as signing. [did:key](https://w3c-ccg.github.io/did-method-key/) is
the most minimal version of these functions.

For _did:key_ a subject is assumed to own a private key. The private key is deterministically
mapped to a DID Document, DID identifier, and has a proper DID URL to identify the public key as key id.
Then, it is possible to put the key id in a JWS, creating a minimal DID signature verification process.

## Install

Using [pnpm](https://pnpm.js.org):

```
pnpm add @vessel-kit/identity
```

Using [yarn](https://yarnpkg.com):

```
yarn add @vessel-kit/identity
```

Using [yarn](https://yarnpkg.com):

```
npm add @vessel-kit/identity
```

## Usage

Mainly the package is concerned with signatures in [JWS](https://tools.ietf.org/html/rfc7515) format.
The full lifecycle is (1) create a signature that is sign a payload, (2) verify the signature against public key.
To sign a payload one would have to own a private key. For managed private key see `IPrivateKey` and `PrivateKeyFactory`.

We assume the private key is a part of DID. JWS contains its key identifier as `kid` header.
This `kid` is a DID URL.

Signature verification happens against _DID_, not individual public key. DID Resolver resolves public key by DID URL in `kid`.

```ts
import { PrivateKeyFactory, AlgorithmKind, KeyMethod, jws } from '@vessel-kit/identity';
import { Resolver } from 'did-resolver';

// Get private key somehow. Here it is a managed instance.
const privateKeyFactory = new PrivateKeyFactory();
const privateKey = privateKeyFactory.fromSeed(AlgorithmKind.ES256K, 'seed');
// SignerIdentified can communicate `kid` according to did:key method.
const signer = await KeyMethod.SignerIdentified.fromPrivateKey(privateKey);
// Create signature as JWS compact serialization
const signature = await jws.create(signer, { hello: 'world' });
// Prepare resolver to discover public key identified by `kid`
const resolver = new Resolver({
  ...KeyMethod.getResolver(),
});
// Verify
const isVerified = await jws.verify(signature, resolver); // Expect true.
```

## License

[MIT](https://opensource.org/licenses/MIT) or [Apache-2.0](https://opensource.org/licenses/Apache-2.0).
