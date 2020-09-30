import * as uuid from 'uuid';

export class UuidValue {
  private readonly v: string;

  constructor(_value?: string) {
    if (_value) {
      this.v = _value;
    } else {
      this.v = uuid.v4();
    }
  }

  toString() {
    return this.v;
  }

  valueOf() {
    return this.v;
  }
}
