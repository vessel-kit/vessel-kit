import type { DIDDocument } from 'did-resolver'
import { ThreeIdContent } from '../three-id.content';
import { DidPresentation } from '../did.presentation';
import { decodeJWT, verifyJWT } from 'did-jwt';
import base64url from 'base64url';

export class InvalidSignatureError extends Error {
}

export function wrapThreeId(id: string, content: ThreeIdContent): DIDDocument {
  const presentation = new DidPresentation(id, content)
  return presentation.toJSON()
}

function withNormalizedHeader(jwt: string) {
  const {header} = decodeJWT(jwt)
  const correctHeader = {typ: header.typ, alg: header.alg}
  const encodedCorrectHeader = base64url(JSON.stringify(correctHeader))
  const parts = jwt.split('.')
  return [encodedCorrectHeader, parts[1], parts[2]].join('.')
}

export async function verifyThreeId(jwt: string, id: string, content: ThreeIdContent): Promise<void> {
  const didPresentation = wrapThreeId(id, content)
  const normalized = withNormalizedHeader(jwt)
  try {
    await verifyJWT(normalized, {
      resolver: {
        resolve: async () => didPresentation
      }
    })
  } catch (e) {
    console.error(e)
    throw new InvalidSignatureError(`Invalid signature for ${id}`)
  }
}
