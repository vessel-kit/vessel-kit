import { DIDDocument, Resolver } from 'did-resolver';
import { IResolver, KeyMethod } from '@vessel-kit/identity';

export class DIDResolver implements IResolver {
  #resolver: Resolver;

  constructor() {
    this.#resolver = new Resolver({
      ...KeyMethod.getResolver(),
    });
  }

  resolve(didUrl: string): Promise<DIDDocument> {
    return this.#resolver.resolve(didUrl);
  }
}
