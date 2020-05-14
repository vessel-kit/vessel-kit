export class UnreachableCaseError extends Error {
  constructor(something: never) {
    super(`Unreachable case: ${something}`);
  }
}
