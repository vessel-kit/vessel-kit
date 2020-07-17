import * as jose from 'jose';
import * as t from 'io-ts';
import { JWKMulticodecCodec } from '../signor/jwk.multicodec.codec';
import {
  BufferMultibaseCodec,
  RecordWrap,
  SimpleCodec,
  CeramicDocumentId,
  decodeThrow,
} from '@potter/codec';
import { doctype } from '../document/doctype';
import { DocumentState } from '../document/document.state';
import produce from 'immer';
import { AnchoringStatus, AnchorProof } from '@potter/anchoring';
import { Chain } from '..';
import * as _ from 'lodash';
import base64url from 'base64url';
import sortKeys from 'sort-keys';
import { DIDDocument } from 'did-resolver';
import * as multicodec from 'multicodec';
import { decodeJWT, verifyJWT } from 'did-jwt';
import jsonPatch from 'fast-json-patch';

export class InvalidDocumentUpdateLinkError extends Error {}

function publicKeyHex(key: jose.JWK.Key): string {
  const multicodecBuffer = JWKMulticodecCodec.encode(key);
  return '04' + multicodec.rmPrefix(multicodecBuffer).toString('hex');
}

function publicKeyBase64(key: jose.JWK.Key): string {
  const multicodecBuffer = JWKMulticodecCodec.encode(key);
  return multicodec.rmPrefix(multicodecBuffer).toString('base64');
}

export class InvalidSignatureError extends Error {}

export class DidPresentation {
  private readonly id: string;

  constructor(id: string, private readonly document: ThreeIdFreight) {
    this.id = id;
  }

  toJSON() {
    const document: any = {
      '@context': 'https://w3id.org/did/v1',
      id: this.id,
      publicKey: [
        {
          id: `${this.id}#signingKey`,
          type: 'Secp256k1VerificationKey2018',
          owner: this.id,
          publicKeyHex: publicKeyHex(this.document.content.publicKeys.signing),
        },
        {
          id: `${this.id}#encryptionKey`,
          type: 'Curve25519EncryptionPublicKey',
          owner: this.id,
          publicKeyBase64: publicKeyBase64(this.document.content.publicKeys.encryption),
        },
      ],
      authentication: [
        {
          type: 'Secp256k1SignatureAuthentication2018',
          publicKey: `${this.id}#signingKey`,
        },
      ],
    };

    this.document.owners.forEach((ownerKey, i) => {
      document.publicKey.push({
        id: `${this.id}#managementKey_${i}`,
        type: 'Secp256k1VerificationKey2018',
        owner: this.id,
        publicKeyHex: publicKeyHex(ownerKey),
      });
      document.authentication.push({
        type: 'Secp256k1SignatureAuthentication2018',
        publicKey: `${this.id}#managementKey_${i}`,
      });
    });

    return document;
  }
}

export function wrapThreeId(id: string, content: ThreeIdFreight): DIDDocument {
  const presentation = new DidPresentation(id, content);
  return presentation.toJSON();
}

function withNormalizedHeader(jwt: string) {
  const { header } = decodeJWT(jwt);
  const correctHeader = { typ: header.typ, alg: header.alg };
  const encodedCorrectHeader = base64url(JSON.stringify(correctHeader));
  const parts = jwt.split('.');
  return [encodedCorrectHeader, parts[1], parts[2]].join('.');
}

export async function verifyThreeId(jwt: string, id: string, content: ThreeIdFreight): Promise<void> {
  const didPresentation = wrapThreeId(id, content);
  const normalized = withNormalizedHeader(jwt);
  try {
    await verifyJWT(normalized, {
      resolver: {
        resolve: async () => didPresentation,
      },
    });
  } catch (e) {
    console.error(e);
    throw new InvalidSignatureError(`Invalid signature for ${id}`);
  }
}

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

export const ThreeId = doctype('3id', new SimpleCodec(ThreeIdFreightCodec), {
  async makeGenesis(payload: any): Promise<t.OutputOf<typeof ThreeIdFreightCodec>> {
    await this.json.assertValid(payload);
    return payload;
  },
  async applyGenesis(documentId: CeramicDocumentId, genesis: any): Promise<DocumentState> {
    const payload = await this.makeGenesis(genesis);
    return {
      doctype: payload.doctype,
      current: null,
      freight: payload,
      anchor: {
        status: AnchoringStatus.NOT_REQUESTED as AnchoringStatus.NOT_REQUESTED,
      },
      log: new Chain([documentId.cid]),
    };
  },
  async applyAnchor(anchorRecord: RecordWrap, proof: AnchorProof, state: DocumentState): Promise<DocumentState> {
    return produce(state, async (next) => {
      next.log = next.log.concat(anchorRecord.cid);
      if (next.current) {
        next.freight = next.current;
        next.current = null;
      }
      next.anchor = {
        status: AnchoringStatus.ANCHORED as AnchoringStatus.ANCHORED,
        proof: {
          chainId: proof.chainId.toString(),
          blockNumber: proof.blockNumber,
          timestamp: new Date(proof.blockTimestamp * 1000),
          txHash: proof.txHash,
          root: proof.root,
        },
      };
    });
  },
  async applyUpdate(updateRecord, state: DocumentState): Promise<DocumentState> {
    if (!(updateRecord.load.id && updateRecord.load.id.equals(state.log.first))) {
      throw new InvalidDocumentUpdateLinkError(`Expected ${state.log.first} id while got ${updateRecord.load.id}`);
    }
    const payloadObject = _.omit(updateRecord.load, ['header', 'signature']);
    payloadObject.prev = { '/': payloadObject.prev.toString() };
    payloadObject.id = { '/': payloadObject.id.toString() };
    const encodedPayload = base64url(JSON.stringify(sortKeys(payloadObject, { deep: true })));
    const encodedHeader = base64url(JSON.stringify(updateRecord.load.header));
    const encodedSignature = updateRecord.load.signature;
    const jwt = [encodedHeader, encodedPayload, encodedSignature].join('.');
    const freight = state.freight;
    const threeIdContent = decodeThrow(ThreeIdFreightCodec, freight);
    await verifyThreeId(jwt, `did:3:${state.log.first.toString()}`, threeIdContent);
    const next = jsonPatch.applyPatch(state.current || state.freight, payloadObject.patch, false, false);
    return {
      ...state,
      current: next.newDocument,
      log: state.log.concat(updateRecord.cid),
    };
  },
});
