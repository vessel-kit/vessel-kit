import * as jose from 'jose';
import * as t from 'io-ts';
import { JWKMulticodecCodec } from '../signor/jwk.multicodec.codec';
import { BufferMultibaseCodec } from '@potter/codec';
import { Doctype } from './doctypes';
import { DocumentState } from '../document.state';
import { RecordWrap } from '@potter/codec';
import { RemoteDocument } from '../client';

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

export class ThreeId implements Doctype<ThreeIdFreight> {
  static NAME = '3id';
  static FREIGHT: ThreeIdFreight;

  async makeGenesis(payload: ThreeIdFreight) {
    const applied = Object.assign({}, payload, { doctype: ThreeId.NAME });
    return ThreeIdFreightJSON.encode(applied);
  }

  async applyUpdate(updateRecord: RecordWrap, state: DocumentState): Promise<DocumentState> {
    console.log('ThreeId.applyUpdate')
    return state;
  }
}
