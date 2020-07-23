import { IWithDoctype } from './document/with-doctype.interface';
import { IWIthRawHistory } from './document/reducible';
import { IContext } from './context';

export interface PDoctype<A extends IWithDoctype & IWIthRawHistory = IWithDoctype & IWIthRawHistory> {
  readonly context: IContext
  create(genesisRecord: unknown): Promise<A>
}
