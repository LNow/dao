import { Suite } from "./suite.ts";
export class Test {
  readonly parent: Suite;
  readonly title: string;
  readonly fn: () => void;
  only: boolean = false;
  skip: boolean = false;

  constructor(title: string, parent: Suite, fn: () => void) {
    this.title = title;
    this.parent = parent;
    this.fn = fn;
  }

  fullTitle(): string[] {
    let titlePath = this.parent.titlePath();
    titlePath.push(this.title);
    return titlePath;
  }
}
