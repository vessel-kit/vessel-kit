import { ISignor } from './signor/signor.interface';
import { ThreeId } from './doctypes/three-id.doctype';
import axios from 'axios';
import { DoctypeA, TypedDocument, WithDoctype } from './doctypes/doctypes';
import { decodeThrow } from '@potter/codec';
import { DocumentState } from './document.state';
import { CeramicDocumentId } from '@potter/codec';
import { ThreeIdentifier, ThreeIdentifierCidCodec } from './three-identifier';
import { FrozenSubject } from './frozen-subject';
import { interval, Subscription } from 'rxjs';
import * as _ from 'lodash';
import * as t from 'io-ts';
import { CidObjectCodec, CeramicDocumentIdCidCodec } from '@potter/codec';

const AddOperationCodec = t.type({
  op: t.literal('add'),
  value: t.unknown,
  path: t.string,
});

const RemoveOperationCodec = t.type({
  op: t.literal('remove'),
  path: t.string,
});

const ReplaceOperationCodec = t.type({
  op: t.literal('replace'),
  path: t.string,
});

const MoveOperationCodec = t.type({
  op: t.literal('move'),
  path: t.string,
  from: t.string,
});

const CopyOperationCodec = t.type({
  op: t.literal('copy'),
  path: t.string,
  from: t.string,
});

const TestOperationCodec = t.type({
  op: t.literal('test'),
  path: t.string,
  value: t.unknown,
});

const GetOperationCodec = t.type({
  op: t.literal('_get'),
  path: t.string,
  value: t.unknown,
});

const FastPatchOperationCodec = t.union([
  AddOperationCodec,
  RemoveOperationCodec,
  ReplaceOperationCodec,
  MoveOperationCodec,
  TestOperationCodec,
  CopyOperationCodec,
  GetOperationCodec,
]);

export const UpdateRecordWaiting = t.type({
  patch: t.array(FastPatchOperationCodec),
  prev: CidObjectCodec,
  id: CidObjectCodec.pipe(CeramicDocumentIdCidCodec),
});

export const SignedRecord = t.type({
  iss: t.string.pipe(ThreeIdentifier),
  iat: t.undefined,
  header: t.UnknownRecord,
  signature: t.string,
});

export const UpdateRecord = t.intersection([UpdateRecordWaiting, SignedRecord]);

export class RemoteDocumentService {
  #host: string;
  #context: ISignorContext;

  constructor(host: string, context: ISignorContext) {
    this.#host = host;
    this.#context = context;
  }

  get context() {
    return this.#context;
  }

  // TODO When merging with local one, return subscription too
  requestUpdates(docId: CeramicDocumentId, state$: FrozenSubject<DocumentState>): Subscription {
    const timer = interval(5000);
    return timer.subscribe(async () => {
      const response = await axios.get(`${this.#host}/api/v0/ceramic/${docId.valueOf()}`);
      if (!_.isEqual(response.data, DocumentState.encode(state$.value))) {
        const state = decodeThrow(DocumentState, response.data);
        state$.next(state);
      }
    });
  }

  async update(record: any, state$: FrozenSubject<DocumentState>) {
    const documentId = state$.value.log.first;
    const response = await axios.put(`${this.#host}/api/v0/ceramic/${documentId}`, record);
    const next = decodeThrow(DocumentState, response.data)
    state$.next(next)
  }
}

export class RemoteDocument {
  #id: CeramicDocumentId;
  #state$: FrozenSubject<DocumentState>;
  #remoteUpdateSubscription?: Subscription;
  #service: RemoteDocumentService;

  constructor(state: DocumentState, service: RemoteDocumentService) {
    this.#state$ = new FrozenSubject(state);
    const genesisCid = this.#state$.value.log.first;
    this.#id = new CeramicDocumentId(genesisCid);
    this.#service = service;
  }

  get id(): CeramicDocumentId {
    return this.#id;
  }

  get state() {
    return this.#state$.value;
  }

  get current() {
    return this.state.current || this.state.freight;
  }

  get state$() {
    return this.#state$;
  }

  // TODO When merging with local version, do this on constructor maybe?
  requestUpdates() {
    this.#remoteUpdateSubscription = this.#service.requestUpdates(this.#id, this.state$);
  }

  as<F extends WithDoctype>(doctype: DoctypeA<F>) {
    if (doctype.name === this.state.doctype) {
      return new TypedDocument(this, doctype, this.#service.context);
    } else {
      throw new Error(`Can not cast ${this.state.doctype} as ${doctype.name}`);
    }
  }

  update(record: any) {
    return this.#service.update(record, this.state$);
  }

  close(): void {
    this.#remoteUpdateSubscription.unsubscribe();
  }
}

export interface ISignorContext {
  sign(payload: any, opts?: { useMgmt: boolean }): Promise<void>;
  did(): Promise<ThreeIdentifier | undefined>;
}

export type IContext = ISignorContext;

export class Client {
  #signor?: ISignor;
  #tracked: Map<string, RemoteDocument> = new Map();
  #service: RemoteDocumentService;
  #context: ISignorContext;

  constructor(private readonly host: string) {
    this.#context = {
      sign: async (payload: any, opts?: { useMgmt: boolean }) => {
        const did = await this.#signor.did();
        if (did) {
          const jwt = await this.#signor.sign(payload, opts);
          return {
            ...payload,
            iss: did,
            header: jwt.header,
            signature: jwt.signature,
          };
        } else {
          throw new Error(`No DID set for the signor`);
        }
      },
      did: (): Promise<ThreeIdentifier | undefined> => {
        return this.#signor.did();
      },
    };
    this.#service = new RemoteDocumentService(host, this.#context);
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

  async create<F extends WithDoctype, A extends DoctypeA<F>>(t: A, c: Omit<F, 'doctype'>) {
    const record = await t.makeGenesis(c);
    const response = await axios.post(`${this.host}/api/v0/ceramic`, record);
    const state = decodeThrow(DocumentState, response.data);
    const document = new RemoteDocument(state, this.#service);
    document.requestUpdates();
    return document;
  }

  async load(docId: CeramicDocumentId): Promise<RemoteDocument> {
    const genesisResponse = await axios.get(`${this.host}/api/v0/ceramic/${docId.valueOf()}`);
    const state = decodeThrow(DocumentState, genesisResponse.data);
    const document = new RemoteDocument(state, this.#service);
    document.requestUpdates();
    return document;
  }

  close() {
    this.#tracked.forEach((document) => {
      document.close();
    });
  }
}
