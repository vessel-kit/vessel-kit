# Handlers

## 3id

Genesis:

```
{ "doctype": "3id", "owners": [ "0x123" ], "content": { "publicKeys": { "test": "0xabc" } } }
```

CID: `bafyreid5hbqpacf3cxm2tb55xn4ex4xs3fbbq75khxi6v2uzk546nk54ra`


Update record:

```
{ "content": [ { "op": "add", "path": "/publicKeys", "value": { "test2": "0xdef" } } ], "prev": "bafyreid5hbqpacf3cxm2tb55xn4ex4xs3fbbq75khxi6v2uzk546nk54ra" }
```

UpdateD record:


```
{ "doctype": "3id", "owners": [ "0x123" ], "content": { "publicKeys": { "test": "0xabc", "test2": "0xdef"  } } }
```


## Account-link

Genesis:

```
{ "doctype": "account-link", "owners": [ "0x25954ef14cebbc9af3d71132489a9cfe87043f20@eip155:1" ] }
```


CID: `bafyreihg3i2wdlxbk3njjhvtwb5ttm2o5bct322b3ativrf5vaom2mapga`

Update record:


UpdateD record:




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

