import jose from 'jose';
import { JWTPayload } from './jwt-payload';
import { ThreeIdentifier } from '../three-identifier';

export interface ISignor {
  publicKeys(): Promise<Record<string, jose.JWK.Key>>;
  did(value?: ThreeIdentifier): Promise<ThreeIdentifier>;
  sign(payload: any, opts?: { useMgmt: boolean }): Promise<JWTPayload>;
}
