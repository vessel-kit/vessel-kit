import { Cloud } from './cloud';
import CID from 'cids';

export class ChainService {
  #dispatcher: Cloud

  constructor(dispatcher: Cloud) {
    this.#dispatcher = dispatcher
  }

  fetch(head: CID, accumulator: CID[] = []) {

  }
}
