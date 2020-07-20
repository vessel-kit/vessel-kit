import * as t from 'io-ts';
import { DoctypeHandler } from '../document/doctype';
import { SimpleCodec } from '@potter/codec';
import './ses';

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

  constructor(params: t.TypeOf<typeof json>) {
    this.content = params.content;
  }

  canApply(prev: any, next: any) {
    const compartment = new Compartment({
      module: {},
    });
    const main = compartment.evaluate(this.content.main);
    return main.canApply(prev, next);
  }
}

class VesselRulesetAlphaHandler extends DoctypeHandler<Freight> {
  readonly name = DOCTYPE;
  readonly json = {
    assertValid: jsonCodec.assertValid,
    encode: jsonCodec.encode,
    decode: (i: unknown) => {
      console.log('decode', this.context);
      return new Freight(jsonCodec.decode(i));
    },
  };
}

export const VesselRulesetAlpha = new VesselRulesetAlphaHandler();
