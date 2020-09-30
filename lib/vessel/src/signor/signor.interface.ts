import jose from 'jose';
import { JWTPayload } from './jwt-payload';
import { Identifier } from "@vessel-kit/identity";

export interface ISignor {
  publicKeys(): Promise<Record<string, jose.JWK.Key>>;
  did(value?: Identifier): Promise<Identifier | undefined>;
  sign(payload: any, opts?: { useMgmt: boolean }): Promise<JWTPayload>;
}
