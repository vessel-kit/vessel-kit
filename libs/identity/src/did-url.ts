import * as t from 'io-ts';
import { Identifier, IdentifierStringCodec } from './identifier';
import * as _ from 'lodash';
import * as didResolver from 'did-resolver';
import * as queryString from 'query-string';

/**
 * Programmatic representation of DID URL.
 */
export class DidUrl {
  constructor(
    readonly identifier: Identifier,
    readonly path?: string,
    readonly query?: Record<string, string>,
    readonly fragment?: string,
  ) {}

  toString() {
    return DidUrl.asString.encode(this);
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return 'DidUrl(' + this.toString() + ')';
  }
}

/* istanbul ignore next */
export namespace DidUrl {
  /**
   * Codec for DidUrl ↔ String
   */
  export const asString = new t.Type<DidUrl, string, string>(
    'DidUrl-string',
    (u: unknown): u is DidUrl => u instanceof DidUrl,
    (s, context) => {
      try {
        const parsed = didResolver.parse(s);
        const identifier = new Identifier(parsed.method, parsed.id);
        const query = parsed.query ? (queryString.parse(parsed.query) as Record<string, string>) : undefined;
        const didUrl = new DidUrl(identifier, parsed.path, query, parsed.fragment);
        return t.success(didUrl);
      } catch (e) {
        return t.failure(s, context, e.message);
      }
    },
    (didUrl) => {
      let result = `${IdentifierStringCodec.encode(didUrl.identifier)}`;
      if (didUrl.path) {
        result += didUrl.path;
      }
      if (didUrl.query && !_.isEmpty(didUrl.query)) {
        const queryString = Object.entries(didUrl.query).map(([k, v]) => `${k}=${v}`);
        result += `?${queryString}`;
      }
      if (didUrl.fragment) {
        result += `#${didUrl.fragment}`;
      }
      return result;
    },
  );
}
