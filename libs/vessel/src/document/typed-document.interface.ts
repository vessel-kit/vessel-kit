import { IWithDoctype } from './with-doctype.interface';

export interface ITypedDocument<F extends IWithDoctype> {
  freight: F;
  update(next: F, opts?: { useMgmt: boolean }): Promise<void>;
}
