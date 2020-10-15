
## Anchoring

#### Rationale

Anchoring module services incoming requests from wheel-api.
Wheel-api module is a middleware for handling documents and querying Anchoring API module. 

Talking in common duties of anchoring module are:
- putting data requests on blockchain
- responding with request data status
- responding with anchored content 


Anchoring request is the entity consists of canonical `docId` and `cid` of new document state.

For example:

```
{
  "docId": "vessel://bafyreibw43tmfkw4az3ezb2dkiid6abwx2criw4te2jhti6k523cecjuxm",
  "cid": "bafyreibw43tmfkw4az3ezb2dkiid6abwx2criw4te2jhti6k523cecjuxm"
}
 ```

The purpose of anchoring is to make a stamp to blockchain about
current document state via its CID.
CID (Content IDentifier) is self-describing content-addressed identifiers for distributed systems.
Example:
`bafyreibw43tmfkw4az3ezb2dkiid6abwx2criw4te2jhti6k523cecjuxm`

See more at https://github.com/multiformats/cid

If anchoring service received multiple requests for the same
docId in anchoring interval then only last request will be anchored, others get 
status OUTDATED.

## Merkle tree

Merkle tree (https://en.wikipedia.org/wiki/Merkle_tree) is an abstraction and data structure
 that's commonly using in blockchain industry. This structure allow us to compress
 big hash sequence to more compact one with possibility to check whether some hash was in initial 
 sequence or not.
 
![Merkle tree example schema](merkle_tree.png "Merkle tree example schema") 
<small>Image source: https://en.wikipedia.org/wiki/Merkle_tree</small>
 
 
 Merkle tree operates with 3 basic terms:
 - Merkle root
 - Merkle proof
 - Examining hash  
 
Building of merkle tree:
- we are given with list of values or its hashes
- group hashes by two and calculate hash from this group
- group newly created hashes and repeat calculating of group hash
- if we got one hash -- it's a Merkle tree root. 

Brief example of Merkle tree:

We have array of hashes: 

`['0x1', '0x2', '0x3', '0x4']`

Let `hash('0x1' + '0x2')` will `'0x5'` and `hash('0x3' + '0x4')` will `'0x6'` then we've got

`['0x5', '0x6']`, do hashing operating again (Let `hash('0x5' + '0x6')` will `'0x7'`)

we've found Merkle tree root: `'0x7'` 

#### Structure of Anchoring Merkle node

Merkle node implemented as class template (A is a template variable):
```
{
    id: A,
    left?: MerkleNode<A>,
    right?: MerkleNode<A>,
    _uplink?: MerkleNode<A>
}
```

#### Lifecycle of the anchoring request

![Request Lifecycle](lifecycle.png "Request Lifecycle") 

Lifecycle of request:
1. Request just sent to anchoring api: `PENDING`
2. Doing some operations with request (e.g. putting on blockchain): `PROCESSING`
3. If request was successfully put on blockchain: `ANCHORED`
4. If something going wrong and request failed to persist to blockchain: `FAILED`
5. If between two anchoring events came two or more request for the same docId, then any request except the very recent one become `OUTDATED`


Possible anchoring request statuses:
- NOT_REQUESTED: unknown request.
- PENDING: request was accepted, waiting for processing/anchoring.
- PROCESSING: currently processing request.
- ANCHORED: request data has successfully anchored (put on blockchain).
- FAILED: failed to put state to blockchain
- OUTDATED: request was superseded by more recent for the same vessel document in anchoring time interval.
The more recent one become `ANCHORED`.


### Running REST anchoring self-testing

In order to ensure the anchoring-api server/implementation is functioning according to vessel spec you may run
rest seft-testing.

```cd apps/anchoring-api```

There is a config file for rest testing called env.postman_environment.json.
Yes, config file, because there is no simple env variable passing to Postman's cmd. 
Please, insert actual values for 
- `base_protocol` (default: `http`)
- `base_host` (default: `localhost`)
- `base_port` (default: `3000`)

Then run the test suite via ```yarn test:rest```


### Anchoring endpoints

`GET /api/v0/requests` - get requests information including request list, total count of requests, page size (for pagination)

`GET /api/v0/requests/list/:cid` - get all anchor requests by `:cid`

`POST /api/v0/requests` - the record has been successfully created

`GET /api/v0/stats` - gather statistics about total amount of requests, total amount of anchors, pending requests, next anchoring time

`GET /api/v0/transactions` - gather statistics about transactions, total amount of transactions, page size (for pagination)

`GET /api/v0/health` - get API readiness

`GET /api/v0/anchors` - get anchor information including anchors, total count of anchors, page size (for pagination)

-- 

For handy Swagger docs run

```cd apps/anchoring-api```

```yarn start```

and go to http://localhost:3000/api/swagger
