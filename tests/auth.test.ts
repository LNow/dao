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
  it("fails when called by random wallet", () => {
    const who = ctx.accounts.get("wallet_3")!.address;
    const where = auth.address;
    const what = "bla-bla-bla";

    const sender = ctx.accounts.get("wallet_7")!;

    const receipt = ctx.chain.mineBlock([
      auth.grant(who, where, what, sender),
    ]).receipts[0];

    receipt.result.expectErr().expectUint(AuthModel.Err.ERR_NOT_AUTHORIZED);
  });

  it("succeeds when called by deployer", () => {
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

describe("revoke", () => {
  it("fails when called by random wallet", () => {
    const who = ctx.accounts.get("wallet_2")!.address;
    const where = auth.address;
    const what = "bla-bla-bla";

    const sender = ctx.accounts.get("wallet_1")!;

    const receipt = ctx.chain.mineBlock([
      auth.revoke(who, where, what, sender),
    ]).receipts[0];

    receipt.result.expectErr().expectUint(AuthModel.Err.ERR_NOT_AUTHORIZED);
  });

  it("succeeds when called by contract deployer", () => {
    const who = ctx.accounts.get("wallet_7")!.address;
    const where = auth.address;
    const what = "bla-bla-bla";

    ctx.chain.mineBlock([auth.grant(who, where, what, ctx.deployer)]);
    auth.canCall(who, where, what).expectBool(true);

    // act
    const receipt = ctx.chain.mineBlock([
      auth.revoke(who, where, what, ctx.deployer),
    ]).receipts[0];

    receipt.result.expectOk().expectBool(true);
    auth.canCall(who, where, what).expectBool(false);
  });
});

run();
