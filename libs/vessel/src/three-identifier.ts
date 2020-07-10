import * as t from 'io-ts';

const format = new RegExp(/^did:3:(\w+)$/gi);

export const ThreeIdentifierStringCodec = new t.Type<ThreeIdentifier, string, string>(
  'ThreeIdentifier-string',
  (u): u is ThreeIdentifier => u instanceof ThreeIdentifier,
  (u, context) => {
    try {
      return t.success(ThreeIdentifier.fromString(u));
    } catch (e) {
      return t.failure(u, context, e.message);
    }
  },
  (t) => t.toString(),
);

export class InvalidThreeIdentifierStringError extends Error {
  constructor(did: string) {
    super(`Invalid 3id DID string: ${did}`);
  }
}

export class ThreeIdentifier {
  #address: string;

  constructor(address: string) {
    this.#address = address;
  }

  static fromString(identifier: string) {
    const match = format.exec(identifier);
    if (match && match[1]) {
      return new ThreeIdentifier(match[1]);
    } else {
      throw new InvalidThreeIdentifierStringError(identifier);
    }
  }

  get address() {
    return this.#address;
  }

  toString() {
    return `did:3:${this.#address}`;
  }
}
