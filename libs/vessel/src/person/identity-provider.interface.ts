export interface IdentityProvider {
  send<A = any>(payload: any, origin?: any, callback?: any): Promise<any>;
}
