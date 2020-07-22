import type { IContext } from '../context';

export default class Ruleset {
  constructor(readonly context: IContext) {}

  canApply(current, next) {
    if (current && current.content) {
      return next.content.num > current.content.num;
    } else {
      return true;
    }
  }
}
