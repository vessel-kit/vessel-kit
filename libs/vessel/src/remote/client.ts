import { ISignor } from '../signor/signor.interface';
import { ThreeId } from '../doctypes/three-id';
import axios from 'axios';
import { decodeThrow } from '@potter/codec';
import { DocumentState } from '../document/document.state';
import { CeramicDocumentId } from '@potter/codec';
import { ThreeIdentifier, ThreeIdentifierCidCodec } from '../three-identifier';
import * as t from 'io-ts';
import { CidObjectCodec, CeramicDocumentIdCidCodec, FastPatchOperationJsonCodec } from '@potter/codec';
import { RemoteDocumentService } from './remote-document-service';
import { Context } from '../context';
import { Document } from '../document/document';
import { IWithDoctype } from '../document/with-doctype.interface';
import { IDocument } from '../document/document.interface';
import { IDoctype } from '../document/doctype';

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
  #tracked: Map<string, Document> = new Map();
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

  async addSignor(signor: ISignor): Promise<IDocument> {
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

  async create<F extends IWithDoctype, A extends IDoctype<F>>(t: A, payload: Omit<F, 'doctype'>) {
    const applied = Object.assign({}, payload, { doctype: t.name });
    const record = await t.makeGenesis(applied);
    const response = await axios.post(`${this.host}/api/v0/ceramic`, record);
    const state = decodeThrow(DocumentState, response.data);
    return new Document(state, this.#service);
  }

  async load(docId: CeramicDocumentId): Promise<Document> {
    const genesisResponse = await axios.get(`${this.host}/api/v0/ceramic/${docId.valueOf()}`);
    const state = decodeThrow(DocumentState, genesisResponse.data);
    return new Document(state, this.#service);
  }

  close() {
    this.#tracked.forEach((document) => {
      document.close();
    });
  }
}
