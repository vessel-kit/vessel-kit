import '@relmify/jest-fp-ts';
import * as faker from 'faker';
import * as util from 'util';
import { Identifier } from '../identifier';

const method = faker.internet.domainWord();
const id = faker.internet.domainWord();
const identifier = new Identifier(method, id);

describe('Identifier', () => {
  test('constructor', () => {
    expect(identifier.method).toEqual(method);
    expect(identifier.id).toEqual(id);
  });
  test('#toString', () => {
    expect(identifier.toString()).toEqual(`did:${method}:${id}`);
  });
  test('nodejs inspect', () => {
    expect(util.inspect(identifier)).toEqual(`Identifier(${identifier.toString()})`);
  });
});

describe('Identifier.asString', () => {
  const asString = Identifier.asString.encode(identifier);
  test('encode', () => {
    expect(asString).toEqual(`did:${method}:${id}`);
  });
  describe('decode', () => {
    test('ok', () => {
      const decoded = Identifier.asString.decode(asString);
      expect(decoded).toBeRight();
      expect(decoded).toEqualRight(identifier);
    });
    test('not: just string', () => {
      expect(Identifier.asString.decode(faker.random.word())).toBeLeft();
    });
    test('not: just method', () => {
      const nonDID = `did:${faker.random.word()}`;
      expect(Identifier.asString.decode(nonDID)).toBeLeft();
    });
    test('not: with query', () => {
      const nonDID = `did:${faker.random.word()}:${faker.random.word()}?version=33`;
      expect(Identifier.asString.decode(nonDID)).toBeLeft();
    });
  });
  test('is', () => {
    expect(Identifier.asString.is(identifier)).toBeTruthy();
  });
});
