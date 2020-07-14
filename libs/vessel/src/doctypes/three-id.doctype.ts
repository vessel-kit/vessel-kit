import * as jose from 'jose';
import * as t from 'io-ts';
import { JWKMulticodecCodec } from '../signor/jwk.multicodec.codec';
import { BufferMultibaseCodec } from '@potter/codec';

interface ThreeIdFreight {
  doctype: '3id';
  owners: jose.JWK.Key[];
  content: {
    publicKeys: {
      signing: jose.JWK.Key;
      encryption: jose.JWK.Key;
    };
  };
}

const ThreeIdFreightJSON = t.type({
  doctype: t.literal('3id'),
  owners: t.array(t.string.pipe(BufferMultibaseCodec).pipe(JWKMulticodecCodec)),
  content: t.type({
    publicKeys: t.type({
      encryption: t.string.pipe(BufferMultibaseCodec).pipe(JWKMulticodecCodec),
      signing: t.string.pipe(BufferMultibaseCodec).pipe(JWKMulticodecCodec),
    }),
  }),
});

export class ThreeId {
  static NAME = '3id';
  static FREIGHT: ThreeIdFreight;

  async makeGenesis(payload: ThreeIdFreight) {
    return ThreeIdFreightJSON.encode(payload);
  }
}

type Doctype = {
  NAME: string;
  FREIGHT: unknown;
  new (): {
    makeGenesis(payload: Doctype['FREIGHT']): Promise<any>;
  };
};

function create<A extends Doctype>(t: A, c: Omit<A['FREIGHT'], 'doctype'>): void;
function create(t: string, c: any): void;
function create<A extends Doctype>(t: A | string, c: Omit<A['FREIGHT'], 'doctype'>): void {
  if (typeof  t !== 'string') {
    // const a  = new t()
  }
}

create(ThreeId, {
  owners: [jose.JWK.generateSync('oct')],
  content: { publicKeys: { encryption: jose.JWK.generateSync('EC'), signing: jose.JWK.generateSync('EC') } },
});

create('3id', { owners: 3 });

// create(ThreeId, {
//   doctype: '3id',
//   foo: 'bsd',
//   owners: [jose.JWK.generateSync('EC')],
//   content: { publicKeys: { encryption: jose.JWK.generateSync('EC'), signing: jose.JWK.generateSync('EC') } },
// });
