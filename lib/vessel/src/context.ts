import { ILoad, ThreeIdResolver } from './resolver/three-id-resolver';
import { Resolver } from 'did-resolver';
import { assertSignature } from './assert-signature';
import CID from 'cids';
import { RecordWrap } from '@vessel-kit/codec';
import { AnchorProof } from '@vessel-kit/anchoring';
import { AnchoringService } from './anchoring.service';
import { Identifier, IIdentitySigning, jws } from '@vessel-kit/identity';

export interface IRetrieve {
  (cid: CID, path?: string): Promise<any>;
}

export interface IContext {
  sign(payload: object): Promise<string>;
  did(): Promise<Identifier | undefined>;
  assertSignature(payload: any): Promise<void>;
  verifyAnchor(anchorRecord: RecordWrap): Promise<AnchorProof>;
  retrieve: IRetrieve;
}

export class Context implements IContext {
  readonly #signorP: () => IIdentitySigning;
  readonly #load: ILoad;
  readonly #resolver: Resolver;
  readonly #retrieve: IRetrieve;
  readonly #anchoring?: AnchoringService;

  constructor(signorP: () => IIdentitySigning, load: ILoad, retrieve: IRetrieve, anchoring?: AnchoringService) {
    this.#signorP = signorP;
    this.#load = load;
    const threeIdResolver = new ThreeIdResolver(this.#load);
    this.#resolver = new Resolver(threeIdResolver.registry);
    this.#retrieve = retrieve;
    this.#anchoring = anchoring;
  }

  async retrieve(cid: CID, path?: string): Promise<any> {
    return this.#retrieve(cid, path);
  }

  async sign(payload: object): Promise<string> {
    const signor = await this.#signorP();
    const signature = await signor.sign(payload);
    return jws.asDetached(signature);
  }

  async did(): Promise<Identifier | undefined> {
    const signor = await this.#signorP();
    const threeDid = await signor.did();
    if (threeDid) {
      const parts = threeDid.toString().match(/did:3:(\w+)/);
      if (parts) {
        return new Identifier('3', parts[1]);
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }

  async assertSignature(record: any): Promise<void> {
    return assertSignature(record, this.#resolver);
  }

  async verifyAnchor(anchorRecord: RecordWrap): Promise<AnchorProof> {
    // TODO Make way to verify anchor on client side
    if (this.#anchoring) {
      return this.#anchoring.verify(anchorRecord.load, anchorRecord.cid);
    } else {
      throw new Error(`Context.verifyAnchor: not implemented`);
    }
  }
}

export class EmptyContextError extends Error {
  constructor(method: string) {
    super(`Empty context: no ${method} available`);
  }
}

export const EMPTY_CONTEXT: IContext = {
  did: () => {
    throw new EmptyContextError('did');
  },
  sign: () => {
    throw new EmptyContextError('sign');
  },
  retrieve: () => {
    throw new EmptyContextError('retrieve');
  },
  assertSignature: () => {
    throw new EmptyContextError('assertSignature');
  },
  verifyAnchor: () => {
    throw new EmptyContextError(`verifyAnchor`);
  },
};
