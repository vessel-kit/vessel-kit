import { ISignor } from './signor/signor.interface';
import { ThreeId } from './doctypes/three-id.doctype';
import axios from 'axios';
import { Doctype, DoctypeStatic, WithDoctype } from './doctypes/doctypes';
import { decodeThrow } from '@potter/codec';
import { DocumentState } from './document.state';
import { CeramicDocumentId } from '@potter/codec';
import { ThreeIdentifierCidCodec } from './three-identifier';
import { FrozenSubject } from './frozen-subject';
import { interval, Subscription } from 'rxjs';
import * as _ from 'lodash';

export class RemoteDocumentService {
  constructor(private readonly host: string) {}

  // TODO When merging with local one, return subscription too
  requestUpdates(docId: CeramicDocumentId, state$: FrozenSubject<DocumentState>): Subscription {
    const timer = interval(5000);
    return timer.subscribe(async () => {
      const response = await axios.get(`${this.host}/api/v0/ceramic/${docId.valueOf()}`);
      if (!_.isEqual(response.data, DocumentState.encode(state$.value))) {
        const state = decodeThrow(DocumentState, response.data);
        state$.next(state);
      }
    });
  }
}

export class RemoteDocument {
  #id: CeramicDocumentId;
  #state$: FrozenSubject<DocumentState>;
  #remoteUpdateSubscription?: Subscription;

  constructor(state: DocumentState, private readonly service: RemoteDocumentService) {
    this.#state$ = new FrozenSubject(state);
    const genesisCid = this.#state$.value.log.first;
    this.#id = new CeramicDocumentId(genesisCid);
  }

  get id(): CeramicDocumentId {
    return this.#id;
  }

  get state() {
    return this.#state$.value;
  }

  get state$() {
    return this.#state$;
  }

  // TODO When merging with local version, do this on constructor maybe?
  requestUpdates() {
    this.#remoteUpdateSubscription = this.service.requestUpdates(this.#id, this.state$);
  }
}

export class Client {
  #signor?: ISignor;
  #tracked: Map<string, RemoteDocument> = new Map();
  #service: RemoteDocumentService;

  constructor(private readonly host: string) {
    this.#service = new RemoteDocumentService(host);
  }

  async addSignor(signor: ISignor): Promise<RemoteDocument> {
    this.#signor = signor;
    const did = await this.#signor.did();
    if (did) {
      const cid = ThreeIdentifierCidCodec.encode(did);
      const documentId = new CeramicDocumentId(cid);
      return this.load(documentId);
    } else {
      const publicKeys = await this.#signor.publicKeys();
      const document = await this.create(ThreeId, {
        owners: [publicKeys.managementKey],
        content: {
          publicKeys: {
            encryption: publicKeys.asymEncryptionKey,
            signing: publicKeys.signingKey,
          },
        },
      });
      this.#tracked.set(document.id.toString(), document);
      const did = decodeThrow(ThreeIdentifierCidCodec, document.id.cid);
      await this.#signor.did(did);
      return document;
    }
  }

  async create<F extends WithDoctype, A extends DoctypeStatic<F>>(
    t: A,
    c: Omit<A['FREIGHT'], 'doctype'> | F,
  ): Promise<RemoteDocument> {
    if (typeof t === 'string') {
      throw new Error(`Not Implemented: Client.create(string)`);
    } else {
      const doctype = new t();
      const record = await doctype.makeGenesis(c);
      const genesisResponse = await axios.post(`${this.host}/api/v0/ceramic`, record);
      const state = decodeThrow(DocumentState, genesisResponse.data);
      const document = new RemoteDocument(state, this.#service);
      document.requestUpdates();
      return document;
    }
  }

  async load(docId: CeramicDocumentId): Promise<RemoteDocument> {
    const genesisResponse = await axios.get(`${this.host}/api/v0/ceramic/${docId.valueOf()}`);
    const state = decodeThrow(DocumentState, genesisResponse.data);
    const document = new RemoteDocument(state, this.#service);
    document.requestUpdates();
    return document;
  }
}
