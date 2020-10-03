export interface IWithDoctype {
  doctype: string;
}

export namespace IWithDoctype {
  export function is(u: unknown): u is IWithDoctype {
    return u && typeof u === "object" && "doctype" in u;
  }
}

export class NoDoctypeError extends Error {
  constructor() {
    super("No doctype found in payload");
  }
}
