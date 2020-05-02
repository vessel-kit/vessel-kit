# CIP-1 Doctype Format

> This proposal seeks to specify doctype format as having vendor and version information.

Doctype is a string uniquely representing type of the document in Ceramic network.
Initial specification mandates support of the three doctypes:
- `3id`,
- `tile`,
- `account-link`.

If we acknowledge evolution of the protocol, we have to consider the following propositions:
1. our understanding of what is a document and how it could be handled evolves in time,
2. eventually ceramic protocol could be deployed in a single enterprise setting.

To handle this, we propose to incorporate additional pieces of information into doctype:
- vendor name,
- doctype version,
in addition to the present doctype name.

We propose to format doctype as a string with three slash-delimited elements:
```
<vendor>/<proper-doctype>/<version>
```
Here:
- `<vendor>` represents vendor (or protocol) name; can contain lowercase symbols `[a-z0-9\.]+` starting with letter;
- `<proper-doctype>` represents document type under the vendor (or protocol); can contain lowercase symbols `[a-z0-9\.]+` starting with letter;
- `<version>` is version string as per [SemVerDoc](https://semverdoc.org) specification.

Example:
- `ceramic/3id/1.0.0`,
- `vessel/document/0.0.1` 
