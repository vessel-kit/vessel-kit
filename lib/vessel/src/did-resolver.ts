import { DIDDocument, Resolver } from "did-resolver";
import { IResolver, KeyMethod } from "@vessel-kit/identity";
import ThreeIdResolver from "@ceramicnetwork/3id-did-resolver";
import CeramicClient from "@ceramicnetwork/ceramic-http-client";

export class DIDResolver implements IResolver {
  #resolver: Resolver;

  constructor() {
    const ceramic = new CeramicClient("https://ceramic.3boxlabs.com");
    const threeIdResolver = ThreeIdResolver.getResolver(ceramic as any);
    this.#resolver = new Resolver({
      ...KeyMethod.getResolver(),
      ...threeIdResolver,
    });
  }

  resolve(didUrl: string): Promise<DIDDocument> {
    return this.#resolver.resolve(didUrl);
  }
}
