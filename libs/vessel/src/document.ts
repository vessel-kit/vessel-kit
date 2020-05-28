// import CID from 'cids';
// import { AnchoringState } from './anchoring-state';
// import { Chain } from './chain';
// import { WithEq } from './with-eq';
//
// export interface Recovered<State, Pointer> {
//   pointer: Pointer
//   state: State
// }
//
// export interface AnchoringProof {
//   chainId: string
//   blockNumber: number
//   blockTimestamp: Date
//   txHash: CID
//   root: CID
//   path: string
// }
//
// export interface AnchoredState<State, Pointer> {
//   pointer: Pointer
//   state: State
//   proof: AnchoringProof
// }
//
// export class Document<State, Pointer extends WithEq<Pointer>> {
//   #current: Recovered<State, Pointer>
//
//   constructor(chain: Chain<State, Pointer>) {
//
//   }
// }

import { CeramicDocumentId } from './ceramic-document-id';
import { DocumentService } from './document.service';
import { AnchoringStatus } from './anchoring/anchoring-status';
import * as t from 'io-ts';
import { DocumentState } from './document.state';
import { Observation } from './anchoring/remote-ethereum-anchoring-service';
import { bind } from 'decko';
import { BehaviorSubject, Subscription } from 'rxjs';
import { UnreachableCaseError } from './unreachable-case.error';
import { Chain } from './chain';

export class Document {
  #docId: CeramicDocumentId
  #service: DocumentService
  #state$: BehaviorSubject<t.TypeOf<typeof DocumentState>>
  #anchoringSubscription: Subscription

  constructor(docId: CeramicDocumentId, genesisRecord: any & {doctype: string}, documentService: DocumentService) {
    this.#docId = docId
    this.#service = documentService
    this.#state$ = new BehaviorSubject({
      doctype: genesisRecord.doctype,
      current: null,
      freight: genesisRecord,
      anchor: {
        status: AnchoringStatus.NOT_REQUESTED
      },
      log: new Chain([docId.cid])
    })
    this.#anchoringSubscription = this.#service.handleAnchorStatusUpdate(docId, this.#state$)
  }

  get id() {
    return this.#docId
  }

  requestAnchor() {
    this.#service.requestAnchor(this.#docId, this.#docId.cid)
  }

  toJSON() {
    return {
      docId: this.#docId.valueOf(),
      ...this.#state$.value
    }
  }
}
