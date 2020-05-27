import { Ceramic } from '../ceramic';
import ipfsClient from 'ipfs-http-client';

const IPFS_URL = 'http://localhost:5001';
const ipfs = ipfsClient(IPFS_URL);

async function main() {
  const ceramic = await Ceramic.build(ipfs);
}

main();
