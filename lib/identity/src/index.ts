/**
 * **Identity layer for VesselKit**
 *
 * [DID](https://w3c.github.io/did-core/) provides (amongst others) a way to link private keys to a self-sovereign identifier.
 * The package provides an opinionated programming model to abstract over various DID methods to create and verify signatures, starting
 * with [did:key](https://w3c-ccg.github.io/did-method-key/) method as the most straightforward one.
 *
 * For _did:key_ a subject is assumed to own a private key. The private key is deterministically
 * mapped to a DID Document, DID identifier, and has a proper DID URL to identify the public key as key id.
 * Then, it is possible to put the key id in a JWS, creating a minimal DID signature verification process.
 *
 * ```ts
 * import { PrivateKeyFactory, AlgorithmKind, KeyMethod, jws } from '@vessel-kit/identity';
 * import { Resolver } from 'did-resolver';
 *
 * const privateKeyFactory = new PrivateKeyFactory();
 * const privateKey = privateKeyFactory.fromSeed(AlgorithmKind.ES256K, 'seed');
 * const signer = await KeyMethod.SignerIdentified.fromPrivateKey(privateKey);
 * const signature = await jws.create(signer, { hello: 'world' });
 * const resolver = new Resolver({
 *    ...KeyMethod.getResolver(),
 * });
 * const isVerified = await jws.verify(signature, resolver); // Expect true.
 * ```
 *
 * For more complex DID methods, one would have to provide specific DID resolver instance
 * to [did-resolver](https://github.com/decentralized-identity/did-resolver) and create a proper signer with [[ISignerIdentified]] interface
 * to pass key id for signature verification purposes.
 *
 * @packageDocumentation
 */

export * from './did-url';
export * from './identifier';

export * from './algorithm-kind';

export * from './key-identity';
export * from './identity.interface';
export * from './private-key.interface';
export * from './private-key.factory';
export * from './public-key.interface';
export * from './invalid-algorithm-kind.error';

import * as JWSImport from './jose/jws';
/**
 * Sign and verify JWS against DID rather than individual keys.
 */
export const jws = JWSImport;

import * as KeyMethodImport from './key.method';
/**
 * Resolver for [did:key](https://w3c-ccg.github.io/did-method-key/) method.
 */
export const KeyMethod = KeyMethodImport;

import * as ES256K from './algorithms/ES256K';
import * as EdDSA from './algorithms/EdDSA';
/**
 * Get access to supported algorithms.
 */
export const algorithms = { ES256K, EdDSA };

export { IResolver } from './jose/resolver';
