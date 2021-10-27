import { describe, it, run, Context, beforeEach } from "../../deps.ts";
import { AuthModel } from "../../models/auth.model.ts";
import { StoragePrincipal } from "../../models/storage-principal.model.ts";

let ctx: Context;
let auth: AuthModel;
let storagePrincipal: StoragePrincipal;

beforeEach(() => {
  ctx = new Context();
  auth = ctx.models.get(AuthModel);
  storagePrincipal = ctx.models.get(StoragePrincipal);
});

describe("[Storage Principal]", () => {
  describe("get-value", () => {
    it("returns none when asked for unknown data", () => {
      const id = 23213;
      const name = "blabla";

      const result = storagePrincipal.getValue(id, name);

      result.expectNone();
    });
  });

  describe("new-value", () => {
    it("fails when called by unauthorized principal", () => {
      const sender = ctx.accounts.get("wallet_3")!;
      const id = 123;
      const name = "blabla";
      const value = "SP39E0V32MC31C5XMZEN1TQ3B0PW2RQSJB8TKQEV9";

      const receipt = ctx.chain.mineBlock([
        storagePrincipal.newValue(id, name, value, sender),
      ]).receipts[0];

      receipt.result.expectErr().expectUint(StoragePrincipal.Err.ERR_NOT_AUTHORIZED);
    });

    it("succeeds when called by authorized principal", () => {
      const sender = ctx.accounts.get("wallet_3")!;
      const id = 123;
      const name = "blabla";
      const value = "SP39E0V32MC31C5XMZEN1TQ3B0PW2RQSJB8TKQEV9";

      ctx.chain.mineBlock([
        auth.grant(
          sender.address,
          storagePrincipal.address,
          "new-value",
          ctx.deployer
        ),
      ]);

      const receipt = ctx.chain.mineBlock([
        storagePrincipal.newValue(id, name, value, sender),
      ]).receipts[0];

      receipt.result.expectOk().expectBool(true);
    });

    it("fails when called 2nd time with same arguments", () => {
      const sender = ctx.accounts.get("wallet_3")!;
      const id = 123;
      const name = "blabla";
      const value = "SP39E0V32MC31C5XMZEN1TQ3B0PW2RQSJB8TKQEV9";

      ctx.chain.mineBlock([
        auth.grant(
          sender.address,
          storagePrincipal.address,
          "new-value",
          ctx.deployer
        ),
        storagePrincipal.newValue(id, name, value, sender),
      ]);

      const receipt = ctx.chain.mineBlock([
        storagePrincipal.newValue(id, name, value, sender),
      ]).receipts[0];

      receipt.result.expectErr().expectUint(StoragePrincipal.Err.ERR_VALUE_EXISTS);
    });
  });
});

run();
