#!/usr/bin/env sh

./node_modules/.bin/json2ts src/doctypes/three-id/three-id-shape.schema.json > src/doctypes/three-id/three-id-shape.d.ts
./node_modules/.bin/json2ts src/doctypes/three-id/json-patch.schema.json > src/doctypes/three-id/json-patch.d.ts
./node_modules/.bin/json2ts src/doctypes/tile/tile-shape.schema.json > src/doctypes/tile/tile-shape.d.ts
