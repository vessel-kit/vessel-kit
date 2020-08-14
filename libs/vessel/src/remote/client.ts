import { ISignor } from '../signor/signor.interface';
import { ThreeIdDoctype } from '../doctypes/three-id/three-id-doctype';
import axios from 'axios';
import { BufferMultibaseCodec, decodeThrow } from '@potter/codec';
import { CeramicDocumentId } from '@potter/codec';
import { ThreeIdentifierCidCodec } from '../three-identifier';
import { RemoteDocumentService } from './remote-document-service';
import { Context, IContext } from '../context';
import { Document } from '../document/document';
import { IWithDoctype } from '../document/with-doctype.interface';
import { IDocument, SnapshotCodec } from '../document/document.interface';
import { DoctypesContainer } from '../doctypes-container';
import { TileDoctype } from '../doctypes/tile/tile-doctype';
import CID from 'cids';
import { ThreeIdShape } from '../doctypes/three-id/three-id-shape';
import { ThreeIdState } from '../doctypes/three-id/three-id-state';
import * as t from 'io-ts';
import { JWKMulticodecCodec } from '../signor/jwk.multicodec.codec';
import { bind } from 'decko';
import { VesselRulesetAlphaDoctype } from '../doctypes/vessel-ruleset-alpha-doctype';
import { VesselDocumentAlphaDoctype } from '../doctypes/vessel-document-alpha-doctype';

export class NotThreeIdError extends Error {
  constructor(docId: CeramicDocumentId) {
    super(`Expected 3id document on ${docId}`);
  }
}

const jwkCodec = t.string.pipe(BufferMultibaseCodec).pipe(JWKMulticodecCodec);

export class Client {
  #signor?: ISignor;
  #tracked: Map<string, IDocument<unknown, unknown>> = new Map();
  #service: RemoteDocumentService;
  #doctypes: DoctypesContainer;
  #context: IContext

  constructor(private readonly host: string) {
    const retrieve = async (cid: CID, path?: string) => {
      const url = new URL(`${this.host}/api/v0/cloud/${cid}`);
      if (path) {
        url.searchParams.append('path', path);
      }
      const response = await axios.get(url.toString());
      return JSON.parse(response.data);
    };
    this.#context = new Context(
      () => {
        if (this.#signor) {
          return this.#signor;
        } else {
          throw new Error(`No signor set`);
        }
      },
      this.load.bind(this),
      retrieve
    );
    this.#doctypes = new DoctypesContainer([TileDoctype, ThreeIdDoctype, VesselRulesetAlphaDoctype, VesselDocumentAlphaDoctype], this.#context);
    this.#service = new RemoteDocumentService(host, this.#context);
  }

  get context(): IContext {
    return this.#context
  }

  @bind()
  async addSignor(signor: ISignor): Promise<IDocument<ThreeIdState, ThreeIdShape>> {
    this.#signor = signor;
    const did = await this.#signor.did();
    if (did) {
      const cid = ThreeIdentifierCidCodec.encode(did);
      const documentId = new CeramicDocumentId(cid);
      const document = await this.load(documentId);
      if (document.state.doctype === '3id') {
        return document as IDocument<ThreeIdState, ThreeIdShape>
      } else {
        throw new NotThreeIdError(documentId)
      }
    } else {
      const publicKeys = await this.#signor.publicKeys();
      const canonical: ThreeIdShape = {
        doctype: '3id',
        owners: [jwkCodec.encode(publicKeys.managementKey)],
        content: {
          publicKeys: {
            encryption: jwkCodec.encode(publicKeys.asymEncryptionKey),
            signing: jwkCodec.encode(publicKeys.signingKey)
          }
        }
      }
      const document = await this.create(canonical)
      const did = decodeThrow(ThreeIdentifierCidCodec, document.id.cid);
      await this.#signor.did(did);
      return document as IDocument<ThreeIdState, ThreeIdShape>;
    }
  }

  @bind()
  async create<A extends IWithDoctype>(payload: A) {
    const doctype = this.#doctypes.get(payload.doctype);
    const knead = await doctype.knead(payload);
    const canonical = await doctype.canonical(knead)
    const response = await axios.post(`${this.host}/api/v0/ceramic`, canonical);
    const snapshot = decodeThrow(SnapshotCodec(t.unknown), response.data)
    const document  = new Document(snapshot, doctype, this.#service)
    this.#tracked.set(document.id.valueOf(), document);
    return document
  }

  @bind()
  async load(docId: CeramicDocumentId): Promise<IDocument<unknown, unknown>> {
    const present = this.#tracked.get(docId.valueOf());
    if (present) {
      return present;
    } else {
      const genesisResponse = await axios.get(`${this.host}/api/v0/ceramic/${docId.valueOf()}`);
      const snapshot = decodeThrow(SnapshotCodec(t.unknown), genesisResponse.data)
      const handler = this.#doctypes.get(snapshot.doctype)
      const document = new Document(snapshot, handler, this.#service)
      this.#tracked.set(document.id.valueOf(), document);
      return document;
    }
  }

  @bind()
  close() {
    this.#tracked.forEach((document) => {
      document.close();
    });
  }
}
