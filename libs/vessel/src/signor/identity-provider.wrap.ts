import { IProvider } from './provider.interface';
import { decodeJWT } from 'did-jwt';
import { JWTDecoded } from './jwt-payload';

function openRpcCall(method: string, params: any) {
  return {
    jsonrpc: '2.0',
    id: Math.floor(Math.random() * 10000),
    method,
    params,
  };
}

export interface AuthenticateResponse {
  main: {
    signingKey: string;
    managementKey: string;
    asymEncryptionKey: string;
  };
}

export interface ClaimParams {
  payload: any;
  did: string;
  useMgmt: boolean;
}

export class IdentityProviderWrap {
  #identityProvider: IProvider;

  constructor(identityProvider: IProvider) {
    this.#identityProvider = identityProvider;
  }

  async authenticate(opts: { mgmtPub: boolean }): Promise<AuthenticateResponse> {
    return this.ask<AuthenticateResponse>('3id_authenticate', { mgmtPub: opts.mgmtPub });
  }

  async signClaim(claimParams: ClaimParams): Promise<JWTDecoded> {
    const jwt = await this.ask<string>('3id_signClaim', claimParams);
    console.log('signClaim', jwt)
    return decodeJWT(jwt) as JWTDecoded;
  }

  async ask<A>(method: string, params: any): Promise<A> {
    const response = await this.#identityProvider.send<A>(openRpcCall(method, params));
    if (response.error) {
      throw new Error(`Got errors: ${JSON.stringify(response.error)}`);
    } else {
      return response.result;
    }
  }
}
