import { ThreeIdentifier } from './three-identifier';
import { ISignor } from './signor/signor.interface';
import { ILoad, ThreeIdResolver } from './resolver/three-id-resolver';
import { Resolver } from 'did-resolver';
import { assertSignature } from './assert-signature';
import CID from 'cids';

export interface IRetrieve {
  (cid: CID, path?: string): Promise<any>;
}

export interface IContext {
  sign(payload: any, opts?: { useMgmt: boolean }): Promise<void>;
  did(): Promise<ThreeIdentifier | undefined>;
  assertSignature(payload: any): Promise<void>;
  retrieve: IRetrieve;
}

export class Context implements IContext {
  readonly #signorP: () => ISignor;
  readonly #load: ILoad;
  readonly #resolver: Resolver;
  readonly #retrieve: IRetrieve;

  constructor(signorP: () => ISignor, load: ILoad, retrieve: IRetrieve) {
    this.#signorP = signorP;
    this.#load = load;
    const threeIdResolver = new ThreeIdResolver(this.#load);
    this.#resolver = new Resolver(threeIdResolver.registry);
    this.#retrieve = retrieve;
  }

  async retrieve(cid: CID, path?: string): Promise<any> {
    return this.#retrieve(cid, path);
  }

  async sign(payload: any, opts?: { useMgmt: boolean }) {
    const signor = await this.#signorP();
    const did = await signor.did();
    if (did) {
      const jwt = await signor.sign(payload, opts);
      return {
        ...payload,
        iss: did,
        header: jwt.header,
        signature: jwt.signature,
      };
    } else {
      throw new Error(`No DID set for the signor`);
    }
  }

  async did(): Promise<ThreeIdentifier | undefined> {
    const signor = await this.#signorP();
    return signor.did();
  }

  async assertSignature(record: any): Promise<void> {
    return assertSignature(record, this.#resolver);
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
};
