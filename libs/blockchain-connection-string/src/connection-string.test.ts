import { ConnectionString } from './connection-string';
import { InvalidSchemeError } from './scheme';

describe('.build', () => {
  test('correct string', () => {
    const result = ConnectionString.fromString(
      `eip155+openrpc+https://mainnet.infura.io/non/ws?mnemonic=enemy boat gauge orphan column malbolge prepare cave only first limb garlic&path=m/44'/60'/0'/0/0`,
    );
    expect(result.chain).toEqual('eip155');
    expect(result.messagingProtocol).toEqual('openrpc');
    expect(result.transportProtocol).toEqual('https');
    expect(result.transport).toEqual('https://mainnet.infura.io/non/ws');
    expect(typeof result.options).toEqual('object');
    expect(result.options.get('mnemonic')).toEqual(
      'enemy boat gauge orphan column malbolge prepare cave only first limb garlic',
    );
    expect(result.options.get('path')).toEqual("m/44'/60'/0'/0/0");
  });

  test('urlencoded string', () => {
    const original = `eip155+openrpc+https://mainnet.infura.io/non/ws?mnemonic=enemy boat gauge orphan column malbolge prepare cave only first limb garlic&path=m/44'/60'/0'/0/0`;
    const result = ConnectionString.fromString(encodeURI(original));
    expect(result.chain).toEqual('eip155');
    expect(result.messagingProtocol).toEqual('openrpc');
    expect(result.transportProtocol).toEqual('https');
    expect(result.transport).toEqual('https://mainnet.infura.io/non/ws');
    expect(typeof result.options).toEqual('object');
    expect(result.options.get('mnemonic')).toEqual(
      'enemy boat gauge orphan column malbolge prepare cave only first limb garlic',
    );
    expect(result.options.get('path')).toEqual("m/44'/60'/0'/0/0");
  });

  test('invalid scheme', () => {
    expect(() => {
      ConnectionString.fromString(`pigeon://mainnet.infura.io/non/ws`);
    }).toThrow(InvalidSchemeError);
  });

  test('known transport as scheme', () => {
    const result = ConnectionString.fromString(`https://mainnet.infura.io/non/ws`, {
      messaging: 'openrpc',
      chain: 'eip155',
    });
    expect(result.chain).toEqual('eip155');
    expect(result.messagingProtocol).toEqual('openrpc');
    expect(result.transportProtocol).toEqual('https');
    expect(result.transport).toEqual('https://mainnet.infura.io/non/ws');
  });

  test('invalid host', () => {
    expect(() => {
      ConnectionString.fromString(`eip155+openrpc+https://mainnet:infura.io/non/ws`);
    }).toThrow();
  });
});

describe('#toString', () => {
  test('pass through', () => {
    const original = encodeURI(
      `eip155+openrpc+https://mainnet.infura.io/non/ws?mnemonic=enemy boat gauge orphan column malbolge prepare cave only first limb garlic&path=m/44'/60'/0'/0/0`,
    );
    const a = ConnectionString.fromString(original);
    expect(a.toString()).toEqual(original);
    const b = ConnectionString.fromString(a.toString());
    expect(b.toString()).toEqual(original);
    expect(b.chain).toEqual('eip155');
    expect(b.messagingProtocol).toEqual('openrpc');
    expect(b.transportProtocol).toEqual('https');
    expect(b.transport).toEqual('https://mainnet.infura.io/non/ws');
    expect(typeof b.options).toEqual('object');
    expect(b.options.get('mnemonic')).toEqual(
      'enemy boat gauge orphan column malbolge prepare cave only first limb garlic',
    );
    expect(b.options.get('path')).toEqual("m/44'/60'/0'/0/0");
  });
});
