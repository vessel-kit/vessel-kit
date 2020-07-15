import * as jose from 'jose';
import * as t from 'io-ts';
import { JWKMulticodecCodec } from '../signor/jwk.multicodec.codec';
import { BufferMultibaseCodec, typeAsCodec } from '@potter/codec';
import { doctype } from './doctypes';
import { DocumentState } from '../document.state';

export interface ThreeIdFreight {
  doctype: '3id';
  owners: jose.JWK.Key[];
  content: {
    publicKeys: {
      signing: jose.JWK.Key;
      encryption: jose.JWK.Key;
    };
  };
}

const ThreeIdFreightCodec = t.type({
  doctype: t.literal('3id'),
  owners: t.array(t.string.pipe(BufferMultibaseCodec).pipe(JWKMulticodecCodec)),
  content: t.type({
    publicKeys: t.type({
      encryption: t.string.pipe(BufferMultibaseCodec).pipe(JWKMulticodecCodec),
      signing: t.string.pipe(BufferMultibaseCodec).pipe(JWKMulticodecCodec),
    }),
  }),
});

export const ThreeId = doctype('3id', typeAsCodec(ThreeIdFreightCodec), {
  async makeGenesis(payload: ThreeIdFreight): Promise<any> {
    return ThreeIdFreightCodec.encode(payload);
  },
  async applyUpdate(updateRecord, state: DocumentState): Promise<DocumentState> {
    console.log('ThreeId.applyUpdate');
    return state;
  },
});
