import { BehaviorSubject } from 'rxjs';
import * as _ from 'lodash'

/**
 * Behaviour subject whose value is frozen.
 * Update via `next` is propagated if next value is different.
 */
export class FrozenSubject<A> extends BehaviorSubject<A> {
  constructor(_value: A) {
    super(Object.freeze(_value));
  }

  next(value: A): void {
    const present = this.value
    if (!_.isEqual(present, value)) {
      super.next(Object.freeze(value));
    }
  }
}
