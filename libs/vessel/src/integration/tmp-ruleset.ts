import type { IContext } from '../context';

export default class Ruleset {
  constructor(readonly context: IContext) {
  }

  async canApply(current, next) {
    console.log('+++ CANAPPLY: Ruleset')
    console.log(this.context)
    if (current.content) {
      await this.context.assertSignature2(current)
    }
    if (next.content) {
      await this.context.assertSignature2(next)
    }
    if (current && current.content) {
      return next.content.payload.num > current.content.payload.num;
    } else {
      return true;
    }
  }
}
