import { Hook } from "./hook.ts";
import { Suite } from "./suite.ts";
import { Test } from "./test.ts";

export class Runner {
  run(suite: Suite) {
    this.runSuite(suite, [], [], [], [], suite.hasOnly());
  }

  runSuite(
    suite: Suite,
    beforeAll: Hook[],
    beforeEach: Hook[],
    afterAll: Hook[],
    afterEach: Hook[],
    runOnly: boolean
  ) {
    suite.suites.forEach((childSuite) => {
      this.runSuite(
        childSuite,
        beforeAll.concat(suite.beforeAll),
        beforeEach.concat(suite.beforeEach),
        afterAll.concat(suite.afterAll),
        afterEach.concat(suite.afterEach),
        runOnly
      );
    });

    suite.tests.forEach((test, idx) => {
      let beforeHooks: Hook[] = [];
      let beforeEachHooks = beforeEach.concat(suite.beforeEach);
      let afterEachHooks = afterEach.concat(suite.afterEach);
      let afterHooks: Hook[] = [];

      if (idx === 0) {
        beforeHooks = beforeAll.concat(suite.beforeAll);
      }

      if (idx === suite.tests.length - 1) {
        afterHooks = afterAll.concat(suite.afterAll);
      }

      this.runTest(
        test,
        beforeHooks,
        beforeEachHooks,
        afterHooks,
        afterEachHooks,
        runOnly
      );
    });
  }

  runTest(
    test: Test,
    beforeHooks: Hook[],
    beforeEachHooks: Hook[],
    afterHooks: Hook[],
    afterEachHooks: Hook[],
    runOnly: boolean
  ) {
    const wrappedFn = async () => {
      beforeHooks.forEach((hook) => hook.fn());
      beforeEachHooks.forEach((hook) => hook.fn());

      test.fn();

      afterEachHooks.forEach((hook) => hook.fn());
      afterHooks.forEach((hook) => hook.fn());
    };

    const testDefinition: Deno.TestDefinition = {
      name: test.fullTitle().join(" "),
      fn: wrappedFn,
      sanitizeOps: true,
      sanitizeResources: true,
      sanitizeExit: true,
      ignore: test.skip,
    };

    if (runOnly) {
      testDefinition.only = test.only;
    }

    Deno.test(testDefinition);
  }
}
