export interface ISigner {
  alg: string;
  sign(message: Uint8Array): Promise<Uint8Array>;
}

export interface ISignerIdentified extends ISigner {
  kid: string;
}
