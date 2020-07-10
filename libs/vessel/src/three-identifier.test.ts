import { InvalidThreeIdentifierStringError, ThreeIdentifier } from './three-identifier';

const address = 'foo';
const did = `did:3:${address}`

test('#address', () => {
  const address = 'foo';
  const id = new ThreeIdentifier(address);
  expect(id.address).toEqual(address);
});

test('#toString', () => {
  const id = new ThreeIdentifier(address);
  expect(id.toString()).toEqual(did);
});

test('.fromString', () => {
  const id = ThreeIdentifier.fromString(did)
  expect(id.address).toEqual(address)
  expect(id.toString()).toEqual(did)
})

test('.fromString error', () => {
  expect(() => {
    ThreeIdentifier.fromString(`did:foo`)
  }).toThrow(InvalidThreeIdentifierStringError)
})
