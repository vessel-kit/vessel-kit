import { MerklePath } from './merkle-path';
import { PathDirection } from './path-direction';
import { MerklePathStringCodec } from './merkle-path.string.codec';
import { decodeThrow } from '@vessel-kit/codec';

test('encode', () => {
  const merklePath = new MerklePath([PathDirection.R, PathDirection.L, PathDirection.R]);
  const asString = MerklePathStringCodec.encode(merklePath);
  expect(asString).toEqual('R/L/R');
});

test('encode empty', () => {
  const merklePath = new MerklePath();
  const asString = MerklePathStringCodec.encode(merklePath);
  expect(asString).toEqual('');
});

test('decode', () => {
  const merklePath = decodeThrow(MerklePathStringCodec, 'R/L/R');
  expect(merklePath).toBeInstanceOf(MerklePath);
  expect(merklePath.steps).toEqual([PathDirection.R, PathDirection.L, PathDirection.R]);
});

test('decode empty', () => {
  const merklePath = decodeThrow(MerklePathStringCodec, '');
  expect(merklePath).toBeInstanceOf(MerklePath);
  expect(merklePath.steps).toEqual([]);
});

test('decode garbage', () => {
  expect(() => {
    decodeThrow(MerklePathStringCodec, 'R/as/L');
  }).toThrow();
});

describe('validate', () => {
  test('instance', () => {
    const merklePath = new MerklePath();
    expect(MerklePathStringCodec.is(merklePath)).toBeTruthy();
  });

  test('garbage', () => {
    expect(MerklePathStringCodec.is('garbage')).toBeFalsy();
  });
});
