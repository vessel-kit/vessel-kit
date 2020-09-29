import '@relmify/jest-fp-ts';
import { BytesUnbaseCodec } from '../bytes.unbase.codec';

const seed = 'abcdefghijklmnopqrstuvwxyz';
const textEncoder = new TextEncoder();
const bytes = textEncoder.encode(seed);
const base16 = '6162636465666768696a6b6c6d6e6f707172737475767778797a';
const base64 = 'YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo';
const base58btc = '3yxU3u1igY8WkgtjK92fbJQCd4BZiiT1v25f';

test('base16', () => {
  const codec = BytesUnbaseCodec('base16');
  expect(codec.encode(bytes)).toEqual(base16);
  expect(codec.decode(base16)).toEqualRight(bytes);
});

test('base64', () => {
  const codec = BytesUnbaseCodec('base64');
  expect(codec.encode(bytes)).toEqual(base64);
  expect(codec.decode(base64)).toEqualRight(bytes);
});

test('base58btc', () => {
  const codec = BytesUnbaseCodec('base58btc');
  expect(codec.encode(bytes)).toEqual(base58btc);
  expect(codec.decode(base58btc)).toEqualRight(bytes);
});
