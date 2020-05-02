# CIP-2 Vessel Protocol

> **DRAFT** This proposal proposes inclusion of two new document types, that form basis for self-governed documents.

## Overview

Currently, ceramic protocol specifies document handling in human terms. Rules for valid state transitions are written in human language,
and then interpreted into code. Here we propose adding two document types. One is ruleset - it contains machin-executable
rules of state transitions. Another is for document, state transitions of which are validated agains the ruleset.
Together they open up an opportunity for documents, that are governed by themselves, and require no specific
upfront code for handling in a Ceramic node.

## Ruleset

**Doctype**: `vessel/ruleset/0.0.1`.

Contains machine-executable rules for document validation

### Genesis Record

`owners` field contains 1+ document owners, as DID. `content` field contains the following fields:
- `type` - string, MIME-like-type of the executable code, mandatory,
- `main` - CID of the IPLD-string that contains executable code, mandatory,
- `schema` - CID of the governed document JSON-schema, optional,
- `name` - string, name of the ruleset (TBD format), optional
- `version` - string, version of the ruleset,  optional,
- `description` - optional
- `keywords` -  array of strings, optional
- `homepage` - IRI of the ruleset homepage, optional
- `bugs` - feedback contact, see [NPM](https://docs.npmjs.com/files/package.json#bugs), optional
- `repository` - IRI of where the code lives, see [NPM](https://docs.npmjs.com/files/package.json#repository), optional.

Doctype `vessel/ruleset/0.1` only supports `language` set to `text/javascript`. The executable code
contains JavaScript code that could be executed in Node.js 12 (TBD Need stricter spec or WASM). The code is execude in a [SES](https://github.com/Agoric/SES-shim/) container.
The code must export `canApply` function (through `module.exports = {canApply: <func>`), which accepts two arguments as JSON objects. One is present document, another is the next updated version.
The function must return a boolean value. If the update is valid, it is expected to return `true`, `false` otherwise.
If the update is invalid, Ceramic node rejects it. 

### Signed Record

This should contain a signed update to the document as [json-patch](https://github.com/Starcounter-Jack/JSON-Patch). The update should not modify `language`, `main`, `schema` fields. 

## Document

**Doctype**: `vessel/document/0.0.1`

Defines a document, whose lifecycle is determined by a linked ruleset document.

### Genesis Record

`owners` field contains 1+ DID of the document owners. `content` field contains the following:
- `ruleset` - identifier of the ruleset document, that governs the updates as `ceramic://<docId>`
- `body` - object conforming to JSON-schema from the ruleset.

### Signed Record

This should contain a signed update to the document as [json-patch](https://github.com/Starcounter-Jack/JSON-Patch). The record could be applied to the document if `canApply` of ruleset returns `true`.
