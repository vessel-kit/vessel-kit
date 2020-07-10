import { MerklePath } from './merkle-path';
import { PathDirection } from './path-direction';
import { MerklePathStringCodec } from './merkle-path.string.codec';
import { decodePromise } from '@potter/codec';

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

test('decode', async () => {
  const merklePath = await decodePromise<MerklePath, string, unknown>(MerklePathStringCodec, 'R/L/R');
  expect(merklePath).toBeInstanceOf(MerklePath);
  expect(merklePath.steps).toEqual([PathDirection.R, PathDirection.L, PathDirection.R]);
});

test('decode empty', async () => {
  const merklePath = await decodePromise<MerklePath, string, unknown>(MerklePathStringCodec, '');
  expect(merklePath).toBeInstanceOf(MerklePath);
  expect(merklePath.steps).toEqual([]);
});

test('decode garbage', async () => {
  await expect(decodePromise(MerklePathStringCodec, 'R/as/L')).rejects.toThrow();
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
