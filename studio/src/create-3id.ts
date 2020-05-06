import axios from "axios";
import IdentityWallet from "identity-wallet";

interface AuthenticateResponse {
  id: number,
  'json-rpc': string,
  result: {
    main: {
      signingKey: string,
      managementKey: string
      asymEncryptionKey: string
    }
  },
  spaces: {}
}

function rpcCall(method: string, params: any) {
  return {
    jsonrpc: "2.0",
    id: 1,
    method,
    params
  };
}

async function main() {
  const seed =
    "0x5872d6e0ae7347b72c9216db218ebbb9d9d0ae7ab818ead3557e8e78bf944184";
  const wallet = new IdentityWallet(async () => true, {
    seed
  });
  const provider = wallet.get3idProvider();
  const result = await provider.send<AuthenticateResponse>(
    rpcCall("3id_authenticate", { mgmtPub: true })
  );
  console.log(result)
}

main();
