import { Runner } from "./runner.ts";
import { Suite } from "./suite.ts";

const suite = new Suite("root", true);
const runner = new Runner();

export function describe(title: string, fn: () => void) {
  suite.addSuite(title, fn);
}

export function test(title: string, fn: () => void) {
  suite.addTest(title, fn);
}

export function it(title: string, fn: () => void) {
  suite.addTest(title, fn);
}

export function beforeAll(fn: () => void) {
  suite.addBeforeAll(fn);
}

export function beforeEach(fn: () => void) {
  suite.addBeforeEach(fn);
}

export function afterAll(fn: () => void) {
  suite.addAfterAll(fn);
}

export function afterEach(fn: () => void) {
  suite.addAfterEach(fn);
}

export function run() {
  runner.run(suite);
}

export namespace describe {
  export function skip(title: string, fn: () => void) {
    suite.addSkipSuite(title, fn);
  }

  export function only(title: string, fn: () => void) {
    suite.addOnlySuite(title, fn);
  }
}

export namespace test {
  export function skip(title: string, fn: () => void) {
    suite.addSkipTest(title, fn);
  }

  export function only(title: string, fn: () => void) {
    suite.addOnlyTest(title, fn);
  }
}

export namespace it {
  export function skip(title: string, fn: () => void) {
    suite.addSkipTest(title, fn);
  }

  export function only(title: string, fn: () => void) {
    suite.addOnlyTest(title, fn);
  }
}
