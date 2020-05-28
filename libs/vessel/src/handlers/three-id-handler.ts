import { IHandler } from './handler.interface';
import Joi from '@hapi/joi';
import multibase from 'multibase';
import * as multicodec from 'multicodec';
import * as t from 'io-ts';
import * as tPromise from 'io-ts-promise';
import jose from 'jose';
import base64url from 'base64url';
import { multicodecCodec as PublicKeyMulticodec, PublicKey } from '../public-key';
import { BufferMultibaseCodec } from '..';

const PublicKeyString = Joi.string().custom(value => {
  const buffer = multibase.decode(value);
  const codecIndex = multicodec.getCode(buffer);
  const point = multicodec.rmPrefix(buffer);
  switch (codecIndex) {
    case 0xe7:
      let x = point.slice(0, point.length / 2);
      let y = point.slice(point.length / 2, point.length);
      return new PublicKey(
        jose.JWK.asKey({
          crv: 'secp256k1' as 'secp256k1',
          x: base64url.encode(x),
          y: base64url.encode(y),
          kty: 'EC' as 'EC',
        }),
      );
    case 0xec:
      return new PublicKey(
        jose.JWK.asKey({
          crv: 'X25519' as 'X25519',
          x: base64url.encode(point),
          kty: 'OKP' as 'OKP',
        }),
      );
    default:
      throw new Error(`Unexpected codec ${codecIndex}`);
  }
});

const GENESIS_SCHEMA = Joi.object({
  doctype: Joi.string().valid('3id'),
  owners: Joi.array()
    .items(PublicKeyString)
    .required(),
  content: Joi.object({
    publicKeys: Joi.object({
      signing: PublicKeyString,
      encryption: PublicKeyString,
    }),
  }),
});

const ThreeIdFreight = t.type({
  owners: t.array(t.string.pipe(BufferMultibaseCodec).pipe(PublicKeyMulticodec)),
  content: t.type({
    publicKeys: t.type({
      encryption: t.string.pipe(BufferMultibaseCodec).pipe(PublicKeyMulticodec),
      signing: t.string.pipe(BufferMultibaseCodec).pipe(PublicKeyMulticodec),
    }),
  }),
});

export class ThreeIdHandler implements IHandler {
  async makeGenesis(genesis: any): Promise<any> {
    await GENESIS_SCHEMA.validateAsync(genesis);
    return genesis;
  }

  async applyGenesis(genesis: any) {
    return genesis
  }
}
