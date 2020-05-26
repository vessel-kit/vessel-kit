import * as t from 'io-ts';
import * as _ from 'lodash';
import { map } from 'fp-ts/lib/Either';
import * as TArray from 'fp-ts/lib/Array';

export function MapCodec<V, O, I>(valueCodec: t.Type<V, O, I>) {
  return new t.Type<Map<string, V>, any, any>(
    'MapCodec',
    (input: any): input is any => _.isPlainObject(input),
    input => {
      const pairs = _.toPairs<I>(input).map(pair => {
        const key = pair[0];
        const value = pair[1];
        const decode = valueCodec.decode(value);
        return map<V, [string, V]>(value => [key, value])(decode);
      });
      const errors = TArray.flatten(TArray.lefts(pairs));
      if (TArray.isEmpty(errors)) {
        const values = TArray.rights(pairs);
        return t.success(new Map(values));
      } else {
        return t.failures(errors);
      }
    },
    (entity: Map<string, V>) => {
      let result = {} as any;
      entity.forEach((value, key) => {
        result[key] = valueCodec.encode(value);
      });
      return result;
    },
  );
}
