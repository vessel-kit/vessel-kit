import { MerklePath } from './merkle-path';
import { PathDirection } from './path-direction';

describe('constructor', () => {
  test('steps', () => {
    const directions = [PathDirection.L, PathDirection.R];
    const merklePath = new MerklePath(directions);
    expect(merklePath.steps).toEqual(directions);
  });

  test('steps default', () => {
    const merklePath = new MerklePath();
    expect(merklePath.steps).toEqual([]);
  });

  test('steps empty', () => {
    const merklePath = new MerklePath([]);
    expect(merklePath.steps).toEqual([]);
  });
});

describe('#last', () => {
  test('ok', () => {
    const directions = [PathDirection.L, PathDirection.R];
    const merklePath = new MerklePath(directions);
    expect(merklePath.last).toEqual(PathDirection.R);
  });

  test('empty', () => {
    const merklePath = new MerklePath();
    expect(merklePath.last).toEqual(undefined);
  });
});

describe('#isEmpty', () => {
  test('ok', () => {
    const directions = [PathDirection.L, PathDirection.R];
    const merklePath = new MerklePath(directions);
    expect(merklePath.isEmpty).toBeFalsy();
  });

  test('empty', () => {
    const merklePath = new MerklePath();
    expect(merklePath.isEmpty).toBeTruthy();
  });
});

describe('#initial', () => {
  test('ok', () => {
    const directions = [PathDirection.L, PathDirection.R, PathDirection.L];
    const merklePath = new MerklePath(directions);
    expect(merklePath.initial.steps).toEqual([PathDirection.L, PathDirection.R]);
  });

  test('empty', () => {
    const merklePath = new MerklePath();
    expect(merklePath.initial.isEmpty).toBeTruthy();
  });
});

test('#append', () => {
  const directions = [PathDirection.L, PathDirection.R, PathDirection.L];
  const merklePath = new MerklePath(directions);
  const a = merklePath.append(PathDirection.R);
  expect(a.steps).toEqual([PathDirection.L, PathDirection.R, PathDirection.L, PathDirection.R]);
});

test('#reverse', () => {
  const directions = [PathDirection.L, PathDirection.R, PathDirection.L, PathDirection.R];
  const merklePath = new MerklePath(directions);
  expect(merklePath.reverse().steps).toEqual(directions.reverse());
});
