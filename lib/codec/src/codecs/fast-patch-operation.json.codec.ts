import * as t from 'io-ts';

const AddOperationCodec = t.type({
  op: t.literal('add'),
  value: t.unknown,
  path: t.string,
});

const RemoveOperationCodec = t.type({
  op: t.literal('remove'),
  path: t.string,
});

const ReplaceOperationCodec = t.type({
  op: t.literal('replace'),
  path: t.string,
});

const MoveOperationCodec = t.type({
  op: t.literal('move'),
  path: t.string,
  from: t.string,
});

const CopyOperationCodec = t.type({
  op: t.literal('copy'),
  path: t.string,
  from: t.string,
});

const TestOperationCodec = t.type({
  op: t.literal('test'),
  path: t.string,
  value: t.unknown,
});

const GetOperationCodec = t.type({
  op: t.literal('_get'),
  path: t.string,
  value: t.unknown,
});

export const FastPatchOperationJsonCodec = t.union([
  AddOperationCodec,
  RemoveOperationCodec,
  ReplaceOperationCodec,
  MoveOperationCodec,
  TestOperationCodec,
  CopyOperationCodec,
  GetOperationCodec,
]);
