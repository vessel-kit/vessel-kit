// import IdentityWallet from 'identity-wallet';
// import { User } from '../signor/user';
// import { sleep } from './sleep.util';
// import { Client } from '../remote/client';
// import { Tile } from '../doctypes/tile/tile';
//
// const REMOTE_URL = 'http://localhost:3001';
// const client = new Client(REMOTE_URL);
//
// async function main() {
//   const identityWallet = new IdentityWallet(() => true, {
//     seed: '0xf533035c3339782eb95ffdfb7f485ac2c74545033a7cb2a46b6c91f77ae33b8f',
//   });
//   const user = await User.build(identityWallet.get3idProvider());
//   await client.addSignor(user);
//   const tile = await client.createAs(Tile, {
//     owners: [await user.did()],
//     content: {},
//   });
//   tile.document.state$.subscribe((state) => {
//     console.log(new Date().toLocaleTimeString(), state);
//   });
//   await sleep(61000);
//   await tile.update({
//     ...tile.current,
//     content: {
//       foo: 33,
//     },
//   });
//   await sleep(61000);
//   client.close();
// }
//
// main()
