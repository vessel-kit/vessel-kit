export class NotImplementedError extends Error {
  constructor(message) {
    super(`Not implemented: ${message}`);
  }
}
