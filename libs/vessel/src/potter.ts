import debug from 'debug';
import { IWithDoctype, NoDoctypeError } from './document/with-doctype.interface';
import { PDoctype } from './pdoctype';
import { PThreeId } from './p-three-id';
import { Context, IContext } from './context';
import CID from 'cids';
import axios from 'axios';
import { ISignor } from './signor/signor.interface';
import { Conveyor, ConveyorService, IConveyorService } from './document/conveyor';

const log = debug('potter');

class RemoteConveyorService<A> implements IConveyorService<A>{

}

export class Potter {
  #signor?: ISignor;
  readonly doctypes: Map<string, PDoctype>;

  constructor(private readonly host: string) {
    const retrieve = async (cid: CID, path?: string) => {
      const url = new URL(`${this.host}/api/v0/cloud/${cid}`);
      if (path) {
        url.searchParams.append('path', path);
      }
      const response = await axios.get(url.toString());
      return JSON.parse(response.data);
    };
    const store = async (record: unknown) => {
      const response = await axios.post(`${this.host}/api/v0/cloud/`, record);
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
      () => Promise.reject('TODO'),
      retrieve,
      store,
    );
    const pt = new PThreeId(context);
    this.doctypes = new Map([[pt.name, pt]]);
  }

  async create(genesisRecord: unknown) {
    log.log(`Creating document from genesis record`, genesisRecord);
    if (IWithDoctype.is(genesisRecord)) {
      const doctype = this.doctypes.get(genesisRecord.doctype)
      const state = await doctype.create(genesisRecord)
      return new Conveyor(state)
      // const doctype = this.#doctypes.get(genesisRecord.doctype);
      // this.#logger.debug(`Found handler for doctype "${genesisRecord.doctype}"`);
      // const record = await doctype.makeGenesis(genesisRecord);
      // this.#logger.debug(`Genesis record is valid for doctype "${doctype.name}"`);
      // const cid = await this.#cloud.store(record);
      // this.#logger.debug(`Stored record to IPFS as ${cid.toString()}`);
      // const documentId = new CeramicDocumentId(cid);
      // const document = await this.load(documentId);
      // document.requestAnchor();
      // return document;
    } else {
      log.log(`No doctype found in payload`, genesisRecord);
      throw new NoDoctypeError();
    }
  }
}
