import { UnreachableCaseError } from '../../unreachable-case.error';

export enum Doctype {
  THREE_ID = '3id',
  RULESET_0_0_1 = 'vessel/ruleset/0.0.1'
}

export function doctypeFromString(something: string) {
  const maybeDoctype = something as Doctype;
  switch (maybeDoctype) {
    case Doctype.THREE_ID:
      return Doctype.THREE_ID;
    case Doctype.RULESET_0_0_1:
      return Doctype.RULESET_0_0_1
    default:
      throw new UnreachableCaseError(maybeDoctype);
  }
}
