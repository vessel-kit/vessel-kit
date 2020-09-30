import * as t from 'io-ts';
import { Identifier } from './identifier';
import * as _ from 'lodash';
import * as didResolver from 'did-resolver';
import * as queryString from 'query-string';

/**
 * Programmatic representation of [DID URL](https://www.w3.org/TR/did-core/#did-url-syntax)
 */
export class DidUrl {
  /**
   * @param identifier Naked DID.
   * @param path Path component of DID URL.
   * @param query Query component of DID URL.
   * @param fragment Fragment of DID URL.
   * @example `did:example:123456789abcdefghi?version-id=3#keys-2` is represented as
   * ```ts
   * new DidUrl(new Identifier('example', '123456789abcdefghi'), undefined, {'version-id': '3'}, 'keys-2')
   * ```
   */
  constructor(
    readonly identifier: Identifier,
    readonly path?: string,
    readonly query?: Record<string, string>,
    readonly fragment?: string,
  ) {}

  /**
   * String representation of DID URL.
   * @example `did:example:123456789abcdefghi?version-id=3#keys-2`
   */
  toString(): string {
    return DidUrl.asString.encode(this);
  }

  /**
   * @internal
   */
  [Symbol.for('nodejs.util.inspect.custom')]() {
    return 'DidUrl(' + this.toString() + ')';
  }
}

/* istanbul ignore next */
export namespace DidUrl {
  /**
   * Codec for DidUrl ↔ String.
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
      let result = `${Identifier.asString.encode(didUrl.identifier)}`;
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
