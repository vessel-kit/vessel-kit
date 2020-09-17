import '@relmify/jest-fp-ts';
import faker from 'faker';
import { IdentifierVersion, IdentifierVersionStringCodec } from '../identifier-version';

const method = faker.internet.domainWord();
const id = faker.internet.domainWord();
const version = faker.internet.domainWord();
const identifier = new IdentifierVersion(method, id, version);
const identifierPlain = new IdentifierVersion(method, id);

describe('IdentifierVersion', () => {
  describe('constructor', () => {
    test('with version', () => {
      expect(identifier.method).toEqual(method);
      expect(identifier.id).toEqual(id);
      expect(identifier.version).toEqual(version);
    });

    test('without version', () => {
      expect(identifierPlain.method).toEqual(method);
      expect(identifierPlain.id).toEqual(id);
      expect(identifierPlain.version).toBeUndefined();
    });
  });
  // test('#toString', () => {
  //   expect(identifier.toString()).toEqual(`did:${method}:${id}`);
  // });
  // test('nodejs inspect', () => {
  //   expect(util.inspect(identifier)).toEqual(`Identifier(${identifier.toString()})`);
  // });
});

describe('IdentifierVersionStringCodec', () => {
  // const asString = IdentifierStringCodec.encode(identifier);
  test('encode', () => {
    expect(IdentifierVersionStringCodec.encode(identifierPlain)).toEqual(`did:${method}:${id}`);
    expect(IdentifierVersionStringCodec.encode(identifier)).toEqual(`did:${method}:${id}?version-id=${version}`);
  });
  describe('decode', () => {
    test('with version', () => {
      const decoded = IdentifierVersionStringCodec.decode(IdentifierVersionStringCodec.encode(identifier));
      expect(decoded).toBeRight();
      expect(decoded).toEqualRight(identifier);
    });
    test('without version', () => {
      const decoded = IdentifierVersionStringCodec.decode(IdentifierVersionStringCodec.encode(identifierPlain));
      expect(decoded).toBeRight();
      expect(decoded).toEqualRight(identifierPlain);
    });
    test('not: just string', () => {
      expect(IdentifierVersionStringCodec.decode(faker.random.word())).toBeLeft();
    });
    test('not: just method', () => {
      const nonDID = `did:${faker.random.word()}`;
      expect(IdentifierVersionStringCodec.decode(nonDID)).toBeLeft();
    });
  });
  test('is', () => {
    expect(IdentifierVersionStringCodec.is(identifier)).toBeTruthy();
    expect(IdentifierVersionStringCodec.is(identifierPlain)).toBeTruthy();
  });
});
