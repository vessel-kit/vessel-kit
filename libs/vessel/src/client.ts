import { ISignor } from './signor/signor.interface';
import { ThreeId } from './doctypes/three-id.doctype';
import axios from 'axios';

type Doctype<A> = {
  makeGenesis(payload: A): Promise<any>;
};

type DoctypeStatic<A> = {
  NAME: string;
  FREIGHT: A;
  new (): Doctype<A>;
};

export class Client {
  #signor?: ISignor;

  constructor(private readonly host: string) {}

  async addSignor(signor: ISignor) {
    this.#signor = signor;
    const did = await this.#signor.did();
    if (!did) {
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
      console.log('document', document);
    }
  }

  create<F, A extends DoctypeStatic<F>>(t: A, c: Omit<A['FREIGHT'], 'doctype'>): Promise<void>;
  create(t: string, c: any): Promise<void>;
  async create<F, A extends DoctypeStatic<F>>(t: A | string, c: Omit<A['FREIGHT'], 'doctype'> | F): Promise<void> {
    if (typeof t === 'string') {
      throw new Error(`Not Implemented: Client.create(string)`)
    } else {
      const doctype = new t();
      const record = await doctype.makeGenesis({
        doctype: t.NAME,
        ...c,
      } as F);
      const genesisResponse = await axios.post(`${this.host}/api/v0/ceramic`, record);
      console.log('genesis response', genesisResponse.data);
      return genesisResponse.data;
    }
  }
}
