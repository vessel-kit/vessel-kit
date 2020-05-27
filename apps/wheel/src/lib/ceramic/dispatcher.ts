import { Ipfs } from 'ipfs';
import { Subject } from 'rxjs';

export class Dispatcher {
  #ipfs: Ipfs
  #message$ = new Subject<any>();

  constructor(ipfs: Ipfs) {
    this.#ipfs = ipfs
  }

  storeRecord(genesisRecord: any) {

  }
}
