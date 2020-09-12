import { FindOperator, FindOperatorType, ValueTransformer } from 'typeorm';
import CID from 'cids';

export const cidTransformer: ValueTransformer = {
  to: (entityValue: CID | FindOperator<CID> | undefined) => {
    if (entityValue instanceof FindOperator) {
      const type = (entityValue as any)._type as FindOperatorType; // Beware, private API
      return new FindOperator(type, entityValue.value, entityValue.useParameter, entityValue.multipleParameters);
    } else {
      return entityValue?.toString();
    }
  },
  from: (databaseValue: string) => new CID(databaseValue),
};
