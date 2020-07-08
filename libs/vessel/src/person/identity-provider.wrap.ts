import { IdentityProvider } from './identity-provider.interface';
import { decodeJWT } from 'did-jwt';

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

export interface JWTHeader {
  typ: 'JWT';
  alg: string;
  [x: string]: any;
}

export interface JWTDecoded {
  header: JWTHeader;
  payload: JWTPayload;
  signature: string;
  data: string;
}

export interface JWTPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  iat?: number;
  nbf?: number;
  type?: string;
  exp?: number;
  rexp?: number;
  [x: string]: any;
}

export interface ClaimParams {
  payload: any;
  did: string;
  useMgmt: boolean;
}

export class IdentityProviderWrap {
  #identityProvider: IdentityProvider;

  constructor(identityProvider: IdentityProvider) {
    this.#identityProvider = identityProvider;
  }

  async authenticate(opts: { mgmtPub: boolean }): Promise<AuthenticateResponse> {
    return this.ask<AuthenticateResponse>('3id_authenticate', { mgmtPub: opts.mgmtPub });
  }

  async signClaim(claimParams: ClaimParams): Promise<JWTDecoded> {
    const jwt = await this.ask<string>('3id_signClaim', claimParams);
    return decodeJWT(jwt) as JWTDecoded;
  }

  async ask<A>(method: string, params: any): Promise<A> {
    const response = await this.#identityProvider.send<A>(openRpcCall(method, params));
    if (response.errors) {
      throw new Error(`Got errors: ${JSON.stringify(response.errors)}`);
    } else {
      return response.result;
    }
  }
}
