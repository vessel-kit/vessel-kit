import * as t from 'io-ts';

/**
 * Programmatic representation of DID identifier.
 */
export class Identifier {
  constructor(readonly method: string, readonly id: string) {}

  toString() {
    return IdentifierStringCodec.encode(this);
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return 'Identifier(' + this.toString() + ')';
  }
}

const ID_CHAR = '[a-zA-Z0-9_.-]';
const METHOD = '([a-zA-Z0-9_]+)';
const METHOD_ID = `(${ID_CHAR}+(:${ID_CHAR}+)*)`;
const DID_MATCHER = new RegExp(`^did:${METHOD}:${METHOD_ID}$`);

/**
 * Codec for Identifier ↔ String
 */
export const IdentifierStringCodec = new t.Type<Identifier, string, string>(
  'Identifier-string',
  (u: unknown): u is Identifier => u instanceof Identifier,
  (s, context) => {
    const match = DID_MATCHER.exec(s);
    if (match && match[1] && match[2]) {
      const method = match[1];
      const id = match[2];
      return t.success(new Identifier(method, id));
    } else {
      return t.failure(s, context, 'Invalid DID identifier');
    }
  },
  (identifier) => `did:${identifier.method}:${identifier.id}`,
);
