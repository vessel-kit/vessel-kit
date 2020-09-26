export interface ISigning {
  sign(message: Uint8Array): Promise<Uint8Array>;
}
