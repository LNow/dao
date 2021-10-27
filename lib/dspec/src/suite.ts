import { Hook } from "./hook.ts";
import { Test } from "./test.ts";

export class Suite {
  readonly parent: Suite | undefined;
  private scope: Suite = this;
  readonly isRoot: boolean;
  readonly title: string;
  readonly suites: Suite[] = [];
  readonly tests: Test[] = [];

  readonly beforeAll: Hook[] = [];
  readonly beforeEach: Hook[] = [];
  readonly afterAll: Hook[] = [];
  readonly afterEach: Hook[] = [];
  only: boolean = false;
  skip: boolean = false;

  constructor(
    title: string,
    isRoot: boolean,
    parent?: Suite | undefined,
    only: boolean = false,
    skip: boolean = false
  ) {
    this.title = title;
    this.isRoot = isRoot;
    this.parent = parent;
    this.only = only;
    this.skip = skip;
  }

  addSuite(
    title: string,
    fn: () => void,
    only: boolean = false,
    skip: boolean = false
  ) {
    const parent = this.scope;
    const suite = new Suite(title, false, parent, only, skip);

    this.scope = suite;
    fn();
    this.scope = parent;

    this.scope.suites.push(suite);
  }

  addOnlySuite(title: string, fn: () => void) {
    this.addSuite(title, fn, true, false);
  }

  addSkipSuite(title: string, fn: () => void) {
    this.addSuite(title, fn, false, true);
  }

  addTest(title: string, fn: () => void) {
    const parent = this.scope;
    const test = new Test(title, parent, fn);

    test.only = parent.only;
    test.skip = parent.skip;

    this.scope.tests.push(test);
    return test;
  }

  addOnlyTest(title: string, fn: () => void) {
    const test = this.addTest(title, fn);
    test.only = true;
  }

  addSkipTest(title: string, fn: () => void) {
    const test = this.addTest(title, fn);
    test.skip = true;
  }

  addBeforeAll(fn: () => void) {
    const hook = new Hook(fn);
    this.scope.beforeAll.push(hook);
  }

  addBeforeEach(fn: () => void) {
    const hook = new Hook(fn);
    this.scope.beforeEach.push(hook);
  }

  addAfterAll(fn: () => void) {
    const hook = new Hook(fn);
    this.scope.afterAll.push(hook);
  }

  addAfterEach(fn: () => void) {
    const hook = new Hook(fn);
    this.scope.afterEach.push(hook);
  }

  titlePath() {
    let result: string[] = [];

    if (this.parent) {
      result = result.concat(this.parent.titlePath());
    }

    if (!this.isRoot) {
      result.push(this.title);
    }
    return result;
  }

  hasOnly(): boolean {
    return (
      this.only ||
      this.suites.some((suite) => suite.hasOnly()) ||
      this.tests.some((test) => test.only)
    );
  }
}
