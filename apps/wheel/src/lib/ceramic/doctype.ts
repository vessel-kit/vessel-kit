import { UnreachableCaseError } from '../../unreachable-case.error';

export enum Doctype {
  THREE_ID = '3id',
  RULESET_0_0_1 = 'vessel/ruleset/0.0.1',
  TILE = 'tile',
  ACCOUNT_LINK = 'account-link'
}

export function doctypeFromString(something: string) {
  const maybeDoctype = something as Doctype;
  switch (maybeDoctype) {
    case Doctype.THREE_ID:
      return Doctype.THREE_ID;
    case Doctype.RULESET_0_0_1:
      return Doctype.RULESET_0_0_1
    case Doctype.TILE:
      return Doctype.TILE
    case Doctype.ACCOUNT_LINK:
      return Doctype.ACCOUNT_LINK
    default:
      throw new UnreachableCaseError(maybeDoctype);
  }
}
