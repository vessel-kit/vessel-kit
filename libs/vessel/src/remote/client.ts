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
import { Context } from '../context';

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

export class Client {
  #signor?: ISignor;
  #tracked: Map<string, RemoteDocument> = new Map();
  #service: RemoteDocumentService;

  constructor(private readonly host: string) {
    const context = new Context(() => {
      if (this.#signor) {
        return this.#signor;
      } else {
        throw new Error(`No signor set`);
      }
    });
    this.#service = new RemoteDocumentService(host, context);
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
