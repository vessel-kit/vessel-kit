import { FindOperator, FindOperatorType, ValueTransformer } from 'typeorm';
import { UuidValue } from '@vessel-kit/anchoring';

export const uuidTransformer: ValueTransformer = {
  to: (entityValue: UuidValue | FindOperator<UuidValue> | undefined) => {
    if (entityValue instanceof FindOperator) {
      const type = (entityValue as any)._type as FindOperatorType; // Beware, private API
      return new FindOperator(
        type,
        entityValue.value,
        entityValue.useParameter,
        entityValue.multipleParameters,
      );
    } else {
      return entityValue?.toString();
    }
  },
  from: (databaseValue: string) => new UuidValue(databaseValue),
};
