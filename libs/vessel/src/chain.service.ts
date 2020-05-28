import { Dispatcher } from './dispatcher';
import CID from 'cids';

export class ChainService {
  #dispatcher: Dispatcher

  constructor(dispatcher: Dispatcher) {
    this.#dispatcher = dispatcher
  }

  fetch(head: CID, accumulator: CID[] = []) {

  }
}
