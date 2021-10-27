export class Hook {
  readonly fn: () => void;

  constructor(fn: () => void) {
    this.fn = fn;
  }
}
