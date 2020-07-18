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
import { IDoctype, withContext } from '../document/doctype';
import { DoctypesContainer } from '../doctypes-container';
import { Tile } from '../doctypes/tile';

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
  #tracked: Map<string, IDocument> = new Map();
  #service: RemoteDocumentService;
  #doctypes: DoctypesContainer;

  constructor(private readonly host: string) {
    const context = new Context(() => {
      if (this.#signor) {
        return this.#signor;
      } else {
        throw new Error(`No signor set`);
      }
    }, this.load.bind(this));
    this.#doctypes = new DoctypesContainer([Tile, ThreeId], context);
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
      const threeId = await this.createAs(ThreeId, {
        owners: [publicKeys.managementKey],
        content: {
          publicKeys: {
            encryption: publicKeys.asymEncryptionKey,
            signing: publicKeys.signingKey,
          },
        },
      });
      const did = decodeThrow(ThreeIdentifierCidCodec, threeId.document.id.cid);
      await this.#signor.did(did);
      return threeId.document;
    }
  }

  async create<A extends IWithDoctype>(payload: A) {
    const doctype = this.#doctypes.get(payload.doctype);
    const record = await doctype.makeGenesis(payload);
    const response = await axios.post(`${this.host}/api/v0/ceramic`, record);
    const state = decodeThrow(DocumentState, response.data);
    const document = new Document(state, this.#service);
    this.#tracked.set(document.id.valueOf(), document);
    return document;
  }

  async createAs<F extends IWithDoctype>(doctype: IDoctype<F>, payload: Omit<F, 'doctype'>) {
    const effectiveDoctype = withContext(doctype, this.#service.context);
    const record = await effectiveDoctype.genesisFromFreight(payload);
    const response = await axios.post(`${this.host}/api/v0/ceramic`, record);
    const state = decodeThrow(DocumentState, response.data);
    const document = new Document(state, this.#service);
    this.#tracked.set(document.id.valueOf(), document);
    return document.as(effectiveDoctype);
  }

  async load(docId: CeramicDocumentId): Promise<IDocument> {
    const present = this.#tracked.get(docId.valueOf());
    if (present) {
      return present;
    } else {
      const genesisResponse = await axios.get(`${this.host}/api/v0/ceramic/${docId.valueOf()}`);
      const state = decodeThrow(DocumentState, genesisResponse.data);
      const document = new Document(state, this.#service);
      this.#tracked.set(document.id.valueOf(), document);
      return document;
    }
  }

  close() {
    this.#tracked.forEach((document) => {
      document.close();
    });
  }
}
