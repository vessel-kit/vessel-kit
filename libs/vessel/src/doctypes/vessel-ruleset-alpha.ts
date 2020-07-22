import * as t from 'io-ts';
import { DoctypeHandler } from '../document/doctype';
import { SimpleCodec } from '@potter/codec';
import './ses';
import { IContext } from '../context';

import * as fs from 'fs';
import path from 'path';
import terser from 'terser';
import * as ts from 'typescript';

const DOCTYPE = 'vessel/ruleset/1.0.0';

const json = t.type({
  doctype: t.literal(DOCTYPE),
  content: t.type({
    type: t.literal(`application/javascript`),
    main: t.string,
  }),
});

const jsonCodec = new SimpleCodec(json);

class Freight implements t.TypeOf<typeof json> {
  doctype: typeof DOCTYPE = DOCTYPE;
  content: {
    type: 'application/javascript';
    main: string;
  };

  constructor(params: t.TypeOf<typeof json>, readonly context: IContext) {
    this.content = params.content;
  }

  canApply(prev: any, next: any) {
    const compartment = new Compartment({
      exports: {},
      console: console,
    });
    console.log('comp', compartment.evaluate(this.content.main))
    console.log('exports', exports)
    const Ruleset = compartment.evaluate(this.content.main);
    console.log('Ruleset', Ruleset)
    const ruleset = new Ruleset(this.context);
    return ruleset.canApply(prev, next);
  }
}

class VesselRulesetAlphaHandler extends DoctypeHandler<Freight> {
  readonly name = DOCTYPE;
  readonly json = {
    // assertValid: jsonCodec.assertValid,
    encode: jsonCodec.encode,
    decode: (i: unknown) => {
      return new Freight(jsonCodec.decode(i), this.context);
    },
  };

  async genesisFromRulesetFile(filename: string) {
    const source = await fs.promises.readFile(filename).then((s) => s.toString());
    const outputText = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
    }).outputText;
    const main = terser.minify(outputText, { mangle: false }).code;
    return {
      content: {
        type: 'application/javascript' as 'application/javascript',
        main: main,
      },
    };
  }
}

export const VesselRulesetAlpha = new VesselRulesetAlphaHandler();
