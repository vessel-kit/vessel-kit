import * as t from "io-ts";

/**
 * Programmatic representation of [decentralized identifier](https://www.w3.org/TR/did-core/#dfn-decentralized-identifiers).
 */
export class Identifier {
  /**
   * @param method DID Method, see [DID Syntax](https://www.w3.org/TR/did-core/#did-syntax).
   * @param id Method-specific id, see [DID Syntax](https://www.w3.org/TR/did-core/#did-syntax).
   * @example
   * ```
   * new Identifier('key', 'zQ3shawAiwRa3YbMitAcCyT9PhqPgy4Q4o1va8wzVyz9Lneh7')
   * ````
   */
  constructor(readonly method: string, readonly id: string) {}

  /**
   * String presentation of an identifier in a form `did:<method>:<id>`.
   * @example `did:key:zQ3shawAiwRa3YbMitAcCyT9PhqPgy4Q4o1va8wzVyz9Lneh7`
   */
  toString() {
    return Identifier.asString.encode(this);
  }

  /**
   * @internal
   */
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return "Identifier(" + this.toString() + ")";
  }
}

export namespace Identifier {
  /**
   * @ignore
   */
  const ID_CHAR = "[a-zA-Z0-9_.-]";
  /**
   * @ignore
   */
  const METHOD = "([a-zA-Z0-9_]+)";
  /**
   * @ignore
   */
  const METHOD_ID = `(${ID_CHAR}+(:${ID_CHAR}+)*)`;
  /**
   * @ignore
   */
  const DID_MATCHER = new RegExp(`^did:${METHOD}:${METHOD_ID}$`);

  /**
   * Codec for Identifier ↔ string.
   */
  export const asString = new t.Type<Identifier, string, string>(
    "Identifier-string",
    (u: unknown): u is Identifier => u instanceof Identifier,
    (s, context) => {
      const match = DID_MATCHER.exec(s);
      if (match && match[1] && match[2]) {
        const method = match[1];
        const id = match[2];
        return t.success(new Identifier(method, id));
      } else {
        return t.failure(s, context, "Invalid DID identifier");
      }
    },
    (identifier) => `did:${identifier.method}:${identifier.id}`
  );
}
