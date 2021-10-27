import {
  describe,
  it,
  beforeEach,
  beforeAll,
  afterEach,
  afterAll,
  run,
} from "../mod.ts";

import { assertEquals } from "https://deno.land/std@0.104.0/testing/asserts.ts";

describe("Some description", () => {
  let n = 10;

  beforeAll(() => {
    // This function will be executed only once before all tests
    n = 1;
  });

  beforeEach(() => {
    // This function will be executed before every single test defined at this level
    n++;
  });

  afterAll(() => {
      // This function will be executed after all tests
      console.info("finish");
  });

  afterEach(() => {
      // This function will be executed after each test
      console.info(`\nCurrent value of n: ${n}`)
  })

  it("n should be equal 2", () => {
    assertEquals(n, 2);
  });

  it("n should be equal 3", () => {
    assertEquals(n, 3);
  });

  it("n should be equal 4", () => {
    assertEquals(n, 4);
  });
});

run();