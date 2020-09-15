declare module 'ipfs-http-client' {
  import { Ipfs } from 'types/ipfs';

  export default function ipfsClient(config: any): Ipfs;
}
