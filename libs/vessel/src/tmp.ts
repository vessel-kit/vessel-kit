import * as ts from 'typescript';
import { IContext } from './context';
// import toSource from 'tosource';
import * as fs from 'fs';
import path from 'path';
import terser from 'terser';

const source = fs.readFileSync(path.join(__dirname, 'integration/tmp-ruleset.ts')).toString();

const outputText = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
}).outputText;
console.log('output', outputText);
const minified = terser.minify(outputText, { mangle: false });
console.log('minified', minified);
