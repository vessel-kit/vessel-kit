import { ISignor } from '../signor/signor.interface';
import { ThreeId } from '../doctypes/three-id';
import axios from 'axios';
import { decodeThrow } from '@potter/codec';
import { DocumentState } from '../document/document.state';
import { CeramicDocumentId } from '@potter/codec';
import { ThreeIdentifierCidCodec } from '../three-identifier';
import { RemoteDocumentService } from './remote-document-service';
import { Context } from '../context';
import { Document } from '../document/document';
import { IWithDoctype } from '../document/with-doctype.interface';
import { IDocument } from '../document/document.interface';
import { IDoctype } from '../document/doctype';
import { DoctypesContainer } from '../doctypes-container';
import { Tile } from '../doctypes/tile';
import CID from 'cids';

export class Client {
  #signor?: ISignor;
  #tracked: Map<string, IDocument> = new Map();
  #service: RemoteDocumentService;
  #doctypes: DoctypesContainer;

  constructor(private readonly host: string) {
    const retrieve = async (cid: CID, path?: string) => {
      const url = new URL(`${this.host}/api/v0/cloud/${cid}`);
      if (path) {
        url.searchParams.append('path', path);
      }
      const response = await axios.get(url.toString());
      return JSON.parse(response.data);
    };
    const context = new Context(
      () => {
        if (this.#signor) {
          return this.#signor;
        } else {
          throw new Error(`No signor set`);
        }
      },
      this.load.bind(this),
      retrieve,
    );
    console.log('++ context in constructor ' + JSON.stringify(context))
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
    // console.log('++ Context from client: ' + JSON.stringify(this.#service.context))
    const effectiveDoctype = doctype.withContext(this.#service.context);
    const record = await effectiveDoctype.genesisFromFreight(payload);
    console.log('+++createAs==' + JSON.stringify(record))
    console.log(`${this.host}/api/v0/ceramic`)
    const response = await axios.post(`${this.host}/api/v0/ceramic`, record);
    console.log('++++-- response.data : ' + JSON.stringify(response.data))
    const state = decodeThrow(DocumentState, response.data);
    console.log('++++--state : ' + JSON.stringify(state))
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
