import { ISignor } from '../signor/signor.interface';
import { ThreeId } from '../doctypes/three-id.doctype';
import axios from 'axios';
import { Doctype, WithDoctype } from '../doctypes/doctypes';
import { decodeThrow } from '@potter/codec';
import { DocumentState } from '../document.state';
import { CeramicDocumentId } from '@potter/codec';
import { ThreeIdentifier, ThreeIdentifierCidCodec } from '../three-identifier';
import * as t from 'io-ts';
import { CidObjectCodec, CeramicDocumentIdCidCodec, FastPatchOperationJsonCodec } from '@potter/codec';
import { RemoteDocumentService } from './remote-document-service';
import { RemoteDocument } from './remote-document';

export const UpdateRecordWaiting = t.type({
  patch: t.array(FastPatchOperationJsonCodec),
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

  async create<F extends WithDoctype, A extends Doctype<F>>(t: A, payload: Omit<F, 'doctype'>) {
    const applied = Object.assign({}, payload, { doctype: t.name });
    const record = await t.makeGenesis(applied);
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
