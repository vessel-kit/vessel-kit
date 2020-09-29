import { AlgorithmKind } from '../algorithm-kind';
import { InvalidAlgorithmKindError } from '../invalid-algorithm-kind.error';

describe('fromString', () => {
  test('present', () => {
    const algorithms = [AlgorithmKind.ES256K, AlgorithmKind.EdDSA];
    algorithms.forEach((algo) => {
      expect(AlgorithmKind.fromString(algo)).toEqual(algo);
    });
  });
  test('not found', () => {
    expect(() => AlgorithmKind.fromString('extra')).toThrow(InvalidAlgorithmKindError);
  });
});
