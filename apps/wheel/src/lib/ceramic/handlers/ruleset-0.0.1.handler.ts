import { IHandler } from './handler.interface';
import { DocumentState } from '../document.state';

export class Ruleset001Handler implements IHandler {
  applyGenesis(record: any, cid): Promise<any> {
    throw new Error(`Not implemented: Ruleset001Handler.applyGenesis`)
  }

  applySigned(record: any, cid, state: DocumentState): Promise<DocumentState> {
    throw new Error(`Not implemented: Ruleset001Handler.applySigned`)
  }

  async makeGenesis(record: any): Promise<any> {
    return record;
  }

  makeRecord(state: DocumentState, next: any): Promise<any> {
    throw new Error(`Not implemented: Ruleset001Handler.makeRecord`)
  }
}
