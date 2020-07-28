import { ISignor } from '../signor/signor.interface';
import { ThreeId } from '../doctypes/three-id/three-id';
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
import { Tile } from '../doctypes/tile/tile';
import CID from 'cids';
import { ThreeIdShape } from '../doctypes/three-id/three-id-shape';

export class Client {
  #signor?: ISignor;
  #tracked: Map<string, IDocument<unknown>> = new Map();
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
    this.#doctypes = new DoctypesContainer([Tile, ThreeId], context);
    this.#service = new RemoteDocumentService(host, context);
  }

  async addSignor(signor: ISignor): Promise<IDocument<ThreeIdShape>> {
    this.#signor = signor;
    const did = await this.#signor.did();
    if (did) {
      const cid = ThreeIdentifierCidCodec.encode(did);
      const documentId = new CeramicDocumentId(cid);
      throw new Error('client.addSignor, yes did')
      // FIXME Loading work
      // return this.load(documentId);
    } else {
      throw new Error(`client.addSignor`);
      // FIXME Typed work
      // const publicKeys = await this.#signor.publicKeys();
      // const threeId = await this.createAs(ThreeId, {
      //   owners: [publicKeys.managementKey],
      //   content: {
      //     publicKeys: {
      //       encryption: publicKeys.asymEncryptionKey,
      //       signing: publicKeys.signingKey,
      //     },
      //   },
      // });
      // const did = decodeThrow(ThreeIdentifierCidCodec, threeId.document.id.cid);
      // await this.#signor.did(did);
      // return threeId.document;
    }
  }

  async create<A extends IWithDoctype>(payload: A) {
    const doctype = this.#doctypes.get(payload.doctype);
    const knead = await doctype.knead(payload);
    const canonical = await doctype.canonical(knead)
    const response = await axios.post(`${this.host}/api/v0/ceramic`, canonical);
    console.log('client.create.response', response.data);
    throw new Error(`client.create.response`);
    // FIXME Typed work
    // const documentState = decodeThrow(DocumentState, response.data);
    // const document = new Document(documentState, this.#service);
    // this.#tracked.set(document.id.valueOf(), document);
    // return document;
  }

  // FIXME Typed work
  // async createAs<F extends IWithDoctype>(doctype: IDoctype<any, F>, payload: Omit<F, 'doctype'>) {
  //   const effectiveDoctype = doctype.withContext(this.#service.context);
  //   const record = await effectiveDoctype.genesisFromFreight(payload);
  //   const response = await axios.post(`${this.host}/api/v0/ceramic`, record);
  //   const state = decodeThrow(DocumentState, response.data);
  //   const document = new Document(state, this.#service);
  //   this.#tracked.set(document.id.valueOf(), document);
  //   return document.as(effectiveDoctype);
  // }

  async load(docId: CeramicDocumentId): Promise<IDocument<unknown>> {
    const present = this.#tracked.get(docId.valueOf());
    if (present) {
      return present;
    } else {
      const genesisResponse = await axios.get(`${this.host}/api/v0/ceramic/${docId.valueOf()}`);
      console.log('client.load.response', genesisResponse.data);
      throw new Error('client.load.response');
      // const state = decodeThrow(DocumentState, genesisResponse.data);
      // const document = new Document(state, this.#service);
      // this.#tracked.set(document.id.valueOf(), document);
      // return document;
    }
  }

  close() {
    this.#tracked.forEach((document) => {
      document.close();
    });
  }
}
