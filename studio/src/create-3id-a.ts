import axios from "axios";
import { IDENTITY_WALLET_A } from './signers';

interface AuthenticateResponse {
  id: number;
  "json-rpc": string;
  result: {
    main: {
      signingKey: string;
      managementKey: string;
      asymEncryptionKey: string;
    };
  };
  spaces: {};
}

function rpcCall(method: string, params: any) {
  return {
    jsonrpc: "2.0",
    id: 1,
    method,
    params
  };
}

const ENDPOINT = "http://localhost:3001/api/v0/ceramic";

async function main() {
  const wallet = IDENTITY_WALLET_A
  const provider = wallet.get3idProvider();
  const result = await provider.send<AuthenticateResponse>(
    rpcCall("3id_authenticate", { mgmtPub: true })
  );
  const signingKey = result.result.main.signingKey;
  const encryptionKey = result.result.main.asymEncryptionKey;
  try {
    const postResult = await axios.post(ENDPOINT, {
      doctype: "3id",
      owners: [signingKey],
      content: {
        publicKeys: {
          signing: signingKey,
          encryption: encryptionKey
        }
      }
    });
    console.log(postResult.data);
  } catch (e) {
    console.error(e);
  }
}

main();
