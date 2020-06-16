import type { ParsedDID, DIDResolver, DIDDocument } from 'did-resolver'
import { ThreeIdContent } from '../three-id.content';
import { ThreeId } from '../three-id';
import { JWK } from 'jose';
import { DidPresentation } from '../did.presentation';
import { verifyJWT } from 'did-jwt';

export function wrapThreeId(id: string, content: ThreeIdContent): DIDDocument {
  const presentation = new DidPresentation(id, content)
  return presentation.toJSON()
}

export async function verifyThreeId(jwt: string, id: string, content: ThreeIdContent) {
  const didPresentation = wrapThreeId(id, content)
  const verification = await verifyJWT(jwt, {
    resolver: {
      resolve: async () => didPresentation
    }
  })
  console.log('verifyThree', verification)
}
