/**
 * Used for exhaustive matching while selecting between [[AlgorithmKind]] variants.
 */
export class InvalidAlgorithmKindError extends Error {
  /**
   * @param kind Turns into message like `Invalid algorithm kind <kind>`.
   */
  constructor(kind: never) {
    super(`Invalid algorithm kind ${kind}`);
  }
}
