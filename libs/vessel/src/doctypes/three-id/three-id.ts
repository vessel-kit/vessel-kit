import * as jose from 'jose';
import * as t from 'io-ts';
import { JWKMulticodecCodec } from '../../signor/jwk.multicodec.codec';
import { BufferMultibaseCodec, SimpleCodec } from '@potter/codec';
import { DoctypeHandler } from '../../document/doctype';
import { AnchorState, DocumentState } from '../../document/document.state';
import jsonPatch from 'fast-json-patch';
import { InvalidDocumentUpdateLinkError } from '../invalid-document-update-link.error';
import { UpdateRecordWaiting } from '../../util/update-record.codec';
import { DidPresentation } from './did.presentation';
import { assertSignature } from '../../assert-signature';

const DOCTYPE = '3id'

export interface ThreeIdFreight {
  doctype: typeof DOCTYPE;
  owners: jose.JWK.Key[];
  content: {
    publicKeys: {
      signing: jose.JWK.Key;
      encryption: jose.JWK.Key;
    };
  };
}

const json = new SimpleCodec<ThreeIdFreight>(
  t.type({
    doctype: t.literal(DOCTYPE),
    owners: t.array(t.string.pipe(BufferMultibaseCodec).pipe(JWKMulticodecCodec)),
    content: t.type({
      publicKeys: t.type({
        encryption: t.string.pipe(BufferMultibaseCodec).pipe(JWKMulticodecCodec),
        signing: t.string.pipe(BufferMultibaseCodec).pipe(JWKMulticodecCodec),
      }),
    }),
  }),
);

class ThreeIdHandler extends DoctypeHandler<ThreeIdFreight> {
  name = DOCTYPE;
  json = json;

  async update(document, next) {
    const nextJSON = this.json.encode(next);
    const currentJSON = document.current;
    const patch = jsonPatch.compare(nextJSON, currentJSON);
    const payloadToSign = UpdateRecordWaiting.encode({
      patch: patch,
      prev: document.log.last,
      id: document.id,
    });
    return this.context.sign(payloadToSign, { useMgmt: true });
  }

  async applyUpdate(updateRecord, state: DocumentState): Promise<DocumentState> {
    if (!(updateRecord.load.id && updateRecord.load.id.equals(state.log.first))) {
      throw new InvalidDocumentUpdateLinkError(`Expected ${state.log.first} id while got ${updateRecord.load.id}`);
    }
    const threeIdContent = this.json.decode(state.freight);
    const didPresentation = new DidPresentation(`did:3:${state.log.first.toString()}`, threeIdContent, true);
    const resolver = {
      resolve: async () => didPresentation,
    };
    await assertSignature(updateRecord.load, resolver);
    const next = jsonPatch.applyPatch(state.current || state.freight, updateRecord.load.patch, false, false);
    return {
      ...state,
      current: next.newDocument,
      log: state.log.concat(updateRecord.cid),
    };
  }
}

export const ThreeId = new ThreeIdHandler();
