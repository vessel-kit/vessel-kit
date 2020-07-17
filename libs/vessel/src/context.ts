import { ThreeIdentifier } from './three-identifier';
import { ISignor } from './signor/signor.interface';

export interface IContext {
  sign(payload: any, opts?: { useMgmt: boolean }): Promise<void>;
  did(): Promise<ThreeIdentifier | undefined>;
}

export class Context implements IContext {
  readonly #signorP: () => ISignor;

  constructor(signorP: () => ISignor) {
    this.#signorP = signorP;
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
};
