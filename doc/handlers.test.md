# Handlers

## 3ID

Scenario:
1. Run anchoring service
2. Run wheel node, instance A
3. Run wheel node, instance B
4. Start `libs/vessel/src/post-document-remote.ts`, it will take about 1.5 minutes
5. After it runs, open `bafyreic3pjr64v764qezetbqbyd66djmbhzlbkqr7e3cpceomagkghed2a` document on the node B. The document should contain `foocryption` key entry.

## Account-link

Genesis:

```
{ "doctype": "account-link", "owners": [ "0x25954ef14cebbc9af3d71132489a9cfe87043f20@eip155:1" ], "content": "did:3:bafyreiecedg6ipyvwdwycdjiakhj5hiuuutxlvywtkvckwvsnu6pjbwxae" }
```


CID: `bafyreic3ta54bkn6bpljxfyliitqc5izx2c2hnxznqfnfg6fjr7a7eqvri`

Update record:

```
{ "content": "did:3:bafyreiecedg6ipyvwdwycdjiakhj5hiuuutxlvywtkvckwvsnu6pjbwxad", "prev": "bafyreic3ta54bkn6bpljxfyliitqc5izx2c2hnxznqfnfg6fjr7a7eqvri" }
```

UpdateD record:

```
{ "doctype": "account-link", "owners": [ "0x25954ef14cebbc9af3d71132489a9cfe87043f20@eip155:1" ], "content": "did:3:bafyreiecedg6ipyvwdwycdjiakhj5hiuuutxlvywtkvckwvsnu6pjbwxad" }
```


## Tile

Genesis:


```
{ "doctype": "tile", "owners": [ "did:3:bafyasdfasdf" ], "content": { "much": "data" }}
```

CID: `bafyreihgjdgdrdaezncix7pgixmzzu3q3nf6efmubrsumgnosgol2oa2hm`


Update record:

```
{ "content": [ { "op": "add", "path": "/other", "value": "otherData" } ], "prev": "bafyreihgjdgdrdaezncix7pgixmzzu3q3nf6efmubrsumgnosgol2oa2hm" }
```

UpdateD record:

```
{ "doctype": "tile", "owners": [ "did:3:bafyasdfasdf" ], "content": { "much": "data", "other": "otherData" }}
```

