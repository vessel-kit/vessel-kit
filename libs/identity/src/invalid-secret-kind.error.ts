export class InvalidSecretKindError extends Error {
  constructor(kind: never) {
    super(`Invalid secret kind ${kind}`);
  }
}
