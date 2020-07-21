import * as t from 'io-ts';
import { DoctypeHandler } from '../document/doctype';
import { SimpleCodec } from '@potter/codec';
import './ses';
import { IContext } from '../context';

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
      module: {},
      console: console,
    });
    const Ruleset = compartment.evaluate(this.content.main).default;
    const ruleset = new Ruleset(this.context);
    return ruleset.canApply(prev, next);
  }
}

class VesselRulesetAlphaHandler extends DoctypeHandler<Freight> {
  readonly name = DOCTYPE;
  readonly json = {
    assertValid: jsonCodec.assertValid,
    encode: jsonCodec.encode,
    decode: (i: unknown) => {
      return new Freight(jsonCodec.decode(i), this.context);
    },
  };
}

export const VesselRulesetAlpha = new VesselRulesetAlphaHandler();
