export class InvalidAlgorithmKindError extends Error {
  constructor(kind: never) {
    super(`Invalid secret kind ${kind}`);
  }
}
