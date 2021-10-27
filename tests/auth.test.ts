import { describe, it, run, Context, beforeEach, types } from "../deps.ts";
import { AuthModel } from "../models/auth.model.ts";

let ctx: Context;
let auth: AuthModel;

beforeEach(() => {
  ctx = new Context();
  auth = ctx.models.get(AuthModel);
});

describe("can-call", () => {
  it("return false for unknown data", () => {
    const who = ctx.accounts.get("wallet_3")!.address;
    const where = auth.address;
    const what = "bla-bla-bla";

    const result = auth.canCall(who, where, what);

    result.expectBool(false);
  });
});

describe("grant", () => {
  it("succeeds", () => {
    const who = ctx.accounts.get("wallet_3")!.address;
    const where = auth.address;
    const what = "bla-bla-bla";

    const receipt = ctx.chain.mineBlock([
      auth.grant(who, where, what, ctx.deployer),
    ]).receipts[0];

    receipt.result.expectOk().expectBool(true);
    auth.canCall(who, where, what).expectBool(true);
  });
});

run();
