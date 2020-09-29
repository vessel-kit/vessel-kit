import '@relmify/jest-fp-ts';
import faker from 'faker';
import util from 'util';
import { Identifier } from '../identifier';
import { DidUrl } from '../did-url';

const method = faker.internet.domainWord();
const id = faker.internet.domainWord();
const identifier = new Identifier(method, id);
const path = `/${faker.internet.domainWord()}/${faker.internet.domainWord()}`;
const query = { hello: 'world' };
const fragment = 'service';

const url = new DidUrl(identifier, path, query, fragment);

describe('DidUrl', () => {
  test('constructor', () => {
    expect(url.identifier).toEqual(identifier);
    expect(url.path).toEqual(path);
    expect(url.query).toEqual(query);
    expect(url.fragment).toEqual(fragment);
  });
  test('#toString', () => {
    const queryString = Object.entries(query).map(([k, v]) => `${k}=${v}`);
    const expected = `${identifier}${path}?${queryString}#${fragment}`;
    expect(url.toString()).toEqual(expected);
  });
  test('nodejs inspect', () => {
    expect(util.inspect(url)).toEqual(`DidUrl(${url.toString()})`);
  });
});

describe('DidUrl.asString', () => {
  test('is', () => {
    expect(DidUrl.asString.is(url)).toBeTruthy();
  });
  describe('encode', () => {
    test('just identifier', () => {
      const url = new DidUrl(identifier);
      expect(DidUrl.asString.encode(url)).toEqual(identifier.toString());
    });
    test('with path', () => {
      const url = new DidUrl(identifier, path);
      const expected = `${identifier}${path}`;
      expect(DidUrl.asString.encode(url)).toEqual(expected);
    });
    test('with query', () => {
      const url = new DidUrl(identifier, path, query);
      const queryString = Object.entries(query).map(([k, v]) => `${k}=${v}`);
      const expected = `${identifier}${path}?${queryString}`;
      expect(DidUrl.asString.encode(url)).toEqual(expected);
    });
    test('with fragment', () => {
      const url = new DidUrl(identifier, path, query, fragment);
      const queryString = Object.entries(query).map(([k, v]) => `${k}=${v}`);
      const expected = `${identifier}${path}?${queryString}#${fragment}`;
      expect(DidUrl.asString.encode(url)).toEqual(expected);
    });
  });
  describe('decode', () => {
    test('just identifier', () => {
      const url = new DidUrl(identifier);
      const decoded = DidUrl.asString.decode(DidUrl.asString.encode(url));
      expect(decoded).toBeRight();
      expect(decoded).toEqualRight(url);
    });
    test('with path', () => {
      const url = new DidUrl(identifier, path);
      const decoded = DidUrl.asString.decode(DidUrl.asString.encode(url));
      expect(decoded).toBeRight();
      expect(decoded).toEqualRight(url);
    });
    test('with query', () => {
      const url = new DidUrl(identifier, path, query);
      const decoded = DidUrl.asString.decode(DidUrl.asString.encode(url));
      expect(decoded).toBeRight();
      expect(decoded).toEqualRight(url);
    });
    test('with fragment', () => {
      const url = new DidUrl(identifier, path, query, fragment);
      const decoded = DidUrl.asString.decode(DidUrl.asString.encode(url));
      expect(decoded).toBeRight();
      expect(decoded).toEqualRight(url);
    });
    test('garbage', () => {
      const decoded = DidUrl.asString.decode('did:garbage');
      expect(decoded).toBeLeft();
    });
  });
});
