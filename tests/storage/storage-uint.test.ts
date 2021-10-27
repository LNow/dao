import { describe, it, run, Context, beforeEach } from "../../deps.ts";
import { AuthModel } from "../../models/auth.model.ts";
import { StorageUInt } from "../../models/storage-uint.model.ts";

let ctx: Context;
let auth: AuthModel;
let storageUInt: StorageUInt;

beforeEach(() => {
  ctx = new Context();
  auth = ctx.models.get(AuthModel);
  storageUInt = ctx.models.get(StorageUInt);
});

describe("[Storage UInt]", () => {
  describe("get-value", () => {
    it("returns none when asked for unknown data", () => {
      const id = 23213;
      const name = "blabla";

      const result = storageUInt.getValue(id, name);

      result.expectNone();
    });
  });

  describe("new-value", () => {
    it("fails when called by unauthorized principal", () => {
      const sender = ctx.accounts.get("wallet_3")!;
      const id = 123;
      const name = "blabla";
      const value = 99887766;

      const receipt = ctx.chain.mineBlock([
        storageUInt.newValue(id, name, value, sender),
      ]).receipts[0];

      receipt.result.expectErr().expectUint(StorageUInt.Err.ERR_NOT_AUTHORIZED);
    });

    it("succeeds when called by authorized principal", () => {
      const sender = ctx.accounts.get("wallet_3")!;
      const id = 123;
      const name = "blabla";
      const value = 99887766;

      ctx.chain.mineBlock([
        auth.grant(
          sender.address,
          storageUInt.address,
          "new-value",
          ctx.deployer
        ),
      ]);

      const receipt = ctx.chain.mineBlock([
        storageUInt.newValue(id, name, value, sender),
      ]).receipts[0];

      receipt.result.expectOk().expectBool(true);
    });

    it("fails when called 2nd time with same arguments", () => {
      const sender = ctx.accounts.get("wallet_3")!;
      const id = 123;
      const name = "blabla";
      const value = 99887766;

      ctx.chain.mineBlock([
        auth.grant(
          sender.address,
          storageUInt.address,
          "new-value",
          ctx.deployer
        ),
        storageUInt.newValue(id, name, value, sender),
      ]);

      const receipt = ctx.chain.mineBlock([
        storageUInt.newValue(id, name, value, sender),
      ]).receipts[0];

      receipt.result.expectErr().expectUint(StorageUInt.Err.ERR_VALUE_EXISTS);
    });
  });
});

run();
