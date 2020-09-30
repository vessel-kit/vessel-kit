# Blockchain Connection String

Blockchain connection string is a way to pass connection information to a light-weight blockchain
provider in a single string akin to database connection string.

## Specification

It is common to connect to blockchain node via API. With it come the following considerations:

1. There are multiple blockchains, which is important for blockchain-agnostic applications.
2. There are multiple transports: HTTP OpenRPC, WebSocket OpenRPC, gRPC, GraphQL.
3. A transport might require its own set of additional properties, e.g. bearer token for Infura.
4. Often an application requires different providers or transports based on environment: HTTP provider with private key while developing, WebSocket provider while in production.
5. Often API endpoint comes as an environment variable as per [The Twelve Factor App](https://12factor.net).

Often selection of blockchain connection mechanism is re-invented for every app. We strive to solve this by providing
a universal connection string format, based on which an application could deterministically select an appropriate provider.

Blockchain connection string is based on URL specification defined in [RFC 3986](https://tools.ietf.org/html/rfc3986).
The goal of blockchain connection string is to unify blockchain API connection across:

- different blockchains,
- different messaging protocols,
- different transport protocols,
- different key material.

Blockchain part helps to select appropriate connector in a blockchain-agnostic application.
Transport and messaging protocols are present here separately to avoid ambiguity. GraphQL and OpenRPC messages
could be transmitted over HTTP and WebSocket transports both.

### Syntax

```
blockchain_connection_string = scheme ":" endpoint [ "?" options ]
scheme = known-transport | chain "+" messaging "+" transport
chain = scheme-part
transport = scheme-part
messaging = scheme-part
scheme-part = ALPHA *( ALPHA / DIGIT / "-" / "." )
endpoint = hier-part
options = query
known-transport = "http" | "https" | "ws" | "wss"
```

See [RFC 3986](https://tools.ietf.org/html/rfc3986) for definitions of `hier-part` and `query`.

### Semantics

Each connection string starts with scheme, which contains three parts, separated by `+` sign:

- `chain` identifies blockchain family, like `eip155`, `bip122`, `cosmos`, `lip9`, `polkadot`.
- `transport` represents transport protocol, like `grpc`, `http`, or `ws`,
- `messaging` represents messaging protocol, like `graphql`, `openrpc`.

To maintain compatibility with currently used HTTP API endpoints, known transport protocols could be used instead of full scheme.

`endpoint` is a usual host-port pair. `options` are connection-specific pairs of key-value elements, as in URL query.

### Test Cases

Manually composed examples are below:

```
# Ethereum OpenRPC connection to Infura via HTTPS, read only
eip155+openrpc+https://mainnet.infura.io/
eip155+openrpc+https://mainnet.infura.io/

# Ethereum OpenRPC connection to Infura via WebSocket, using key material for signing
eip155+openrpc+wss://mainnet.infura.io?mnemonic=enemy boat gauge orphan column malbolge prepare cave only first limb garlic&path=m/44'/60'/0'/0/0
```

## Usage

```
const connectionString = ConnectionString.build(`eip155+openrpc+https://mainnet.infura.io/?mnemonic=enemy boat gauge orphan column malbolge prepare cave only first limb garlic&path=m/44'/60'/0'/0/0`)
connectionString.chain #= eip155
connectionString.messagingProtocol #= openrpc
connectionString.transportProtocol #= https
connectionString.transport #= https://mainnet.infura.io/
connectionString.options #= {mnemonic: "enemy boat gauge orphan column malbolge prepare cave only first limb garlic", path: "m/44'/60'/0'/0/0"}
```
