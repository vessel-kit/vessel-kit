import * as path from "path";
import { rollup } from "rollup";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import rollupTypescript from "@rollup/plugin-typescript";
import * as tmp from 'tmp'
import { minify } from "terser";
import * as fs from "fs";

export class RollupAction {
  readonly source: string;
  readonly destination: string;

  constructor(source: string, destination: string) {
    this.source = path.resolve(source);
    this.destination = path.resolve(destination);
  }

  async run() {
    const tmpdir = tmp.dirSync()
    const bundle = await rollup({
      input: this.source,
      plugins: [rollupTypescript({
        outDir: tmpdir.name
      }), nodeResolve()],
    });
    await bundle.write({
      dir: tmpdir.name,
      format: "commonjs",
      sourcemap: true,
    });
    const sourceFilename = path.basename(this.source).replace(/\.ts$/, '.js')
    const resulting = path.resolve(tmpdir.name, sourceFilename);
    const code = fs.readFileSync(resulting).toString();
    const minified = await minify(code);
    const vesselFile = path.resolve(this.destination, "__vessel.json");
    const vesselProps = {
      type: "application/javascript",
      main: minified.code,
    };
    fs.writeFileSync(vesselFile, JSON.stringify(vesselProps, null, 2));

    // tmpdir.removeCallback()
  }
}
