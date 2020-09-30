import { IDocument } from '../..';
import { ThreeIdState } from './three-id-state';
import { ThreeIdShape } from './three-id-shape';
import * as t from 'io-ts';
import { JWKMulticodecCodec } from '../../signor/jwk.multicodec.codec';
import { BytesMultibaseCodec, decodeThrow } from '@vessel-kit/codec';
import jose from 'jose';
import * as _ from 'lodash';
import jsonPatch from 'fast-json-patch';
import { UpdateRecordWaiting } from '../../util/update-record.codec';

const jwkCodec = t.string.pipe(BytesMultibaseCodec('base58btc')).pipe(JWKMulticodecCodec);

type PublicKeys = { encryption: jose.JWK.Key; signing: jose.JWK.Key };

export class ThreeId {
  readonly #document: IDocument<ThreeIdState, ThreeIdShape>;
  #canonical: ThreeIdShape;

  constructor(document: IDocument<ThreeIdState, ThreeIdShape>, canonical: ThreeIdShape) {
    this.#document = document;
    this.#canonical = canonical;
    this.#document.state$.subscribe(async () => {
      this.#canonical = await this.#document.canonical();
    });
  }

  static async fromDocument(document: IDocument<ThreeIdState, ThreeIdShape>) {
    const canonical = await document.canonical();
    return new ThreeId(document, canonical);
  }

  get canonical() {
    return this.#canonical;
  }

  get owners(): jose.JWK.Key[] {
    return this.canonical.owners.map((publicKey) => decodeThrow(jwkCodec, publicKey));
  }

  get publicKeys(): PublicKeys {
    return _.mapValues(this.canonical.content.publicKeys, (key) => decodeThrow(jwkCodec, key));
  }

  async updatePublicKeys(publicKeys: PublicKeys) {
    const encoded = _.mapValues(publicKeys, (key) => jwkCodec.encode(key));
    const next = {
      ...this.canonical,
      content: {
        publicKeys: encoded,
      },
    };
    const patch = jsonPatch.compare(this.canonical, next);
    const payloadToSign = UpdateRecordWaiting.encode({
      patch: patch,
      prev: this.#document.log.last,
      id: this.#document.id,
    });
    const signed = await this.#document.context.sign(payloadToSign, { useMgmt: true });
    return this.#document.update(signed);
  }
}
