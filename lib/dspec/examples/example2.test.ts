import {
  test,
  beforeEach,
  beforeAll,
  afterEach,
  afterAll,
  run,
} from "../mod.ts";

import { assertEquals } from "https://deno.land/std@0.104.0/testing/asserts.ts";

beforeAll(() => {
  console.info("\nExecuted before all tests");
});

afterAll(() => {
  console.info("\nExecuted after all tests");
});

beforeEach(() => {
  console.info("\nExecuted before each test");
});

afterEach(() => {
  console.info("\nExecuted after each test");
});

test("test 1", () => {
  console.log("test 1");
  assertEquals(1, 1);
});

test("test 2", () => {
  console.log("test 2");
  assertEquals(1, 1);
});

run();
