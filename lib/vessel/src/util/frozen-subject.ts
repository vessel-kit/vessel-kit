import { BehaviorSubject, Observable, Subscribable } from 'rxjs';
import * as _ from 'lodash';

export interface FrozenSubjectRead<A> extends Subscribable<A> {
  value: A;
  asObservable(): Observable<A>;
}

/**
 * Behaviour subject whose value is frozen.
 * Update via `next` is propagated if next value is different.
 */
export class FrozenSubject<A> extends BehaviorSubject<A> implements FrozenSubjectRead<A> {
  constructor(_value: A) {
    super(Object.freeze(_value));
  }

  next(value: A): void {
    const present = this.value;
    if (!_.isEqual(present, value)) {
      super.next(Object.freeze(value));
    }
  }
}
