import * as t from 'io-ts';
import { Identifier } from './identifier';
import * as didResolver from 'did-resolver';
import * as queryString from 'query-string';

/**
 * Identifier with version
 */
export class IdentifierVersion extends Identifier {
  constructor(readonly method: string, readonly id: string, readonly version?: string) {
    super(method, id);
  }
}

/**
 * Codec for IdentifierVersion ↔ String
 */
export const IdentifierVersionStringCodec = new t.Type<IdentifierVersion, string, string>(
  'IdentifierVersion-string',
  (u: unknown): u is IdentifierVersion => u instanceof IdentifierVersion,
  (s, context) => {
    try {
      const parsed = didResolver.parse(s);
      const query = parsed.query ? queryString.parse(parsed.query) : undefined;
      const versionParam = query ? query['version-id'] : undefined;
      const version = versionParam && typeof versionParam === 'string' ? versionParam : undefined;
      const identifier = new IdentifierVersion(parsed.method, parsed.id, version);
      return t.success(identifier);
    } catch (e) {
      return t.failure(s, context, e.message);
    }
    // const match = DID_MATCHER.exec(s);
    // if (match && match[1] && match[2]) {
    //   const method = match[1];
    //   const id = match[2];
    //   return t.success(new Identifier(method, id));
    // } else {
    //   return t.failure(s, context, 'Invalid DID identifier');
    // }
  },
  (identifier) => {
    let did = `did:${identifier.method}:${identifier.id}`;
    if (identifier.version) {
      did += `?version-id=${identifier.version}`;
    }
    return did;
  },
);
