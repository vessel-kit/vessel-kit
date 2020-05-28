export class UnknownDoctypeError extends Error {
  constructor(doctype: string) {
    super(`Unknown doctype: ${doctype}`);
  }
}
