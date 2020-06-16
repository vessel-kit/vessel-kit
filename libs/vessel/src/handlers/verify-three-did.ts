import type { DIDDocument } from 'did-resolver'
import { ThreeIdContent } from '../three-id.content';
import { DidPresentation } from '../did.presentation';
import { verifyJWT } from 'did-jwt';

export class InvalidSignatureError extends Error {
}

export function wrapThreeId(id: string, content: ThreeIdContent): DIDDocument {
  const presentation = new DidPresentation(id, content)
  return presentation.toJSON()
}

export async function verifyThreeId(jwt: string, id: string, content: ThreeIdContent): Promise<void> {
  const didPresentation = wrapThreeId(id, content)
  try {
    console.log('verifyThreeId', jwt, didPresentation)
    await verifyJWT(jwt, {
      resolver: {
        resolve: async () => didPresentation
      }
    })
  } catch (e) {
    console.error(e)
    throw new InvalidSignatureError(`Invalid signature for ${id}`)
  }
}
