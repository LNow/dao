import {
  describe,
  it,
  run,
  Context,
  beforeEach,
  types,
  assertEquals,
} from "../deps.ts";
import { AuthModel } from "../models/auth.model.ts";
import { TokenModel } from "../models/token.model.ts";

let ctx: Context;
let auth: AuthModel;
let token: TokenModel;

beforeEach(() => {
  ctx = new Context();
  auth = ctx.models.get(AuthModel);
  token = ctx.models.get(TokenModel);
});

describe("[Token]", () => {
  describe("get-balance", () => {
    it("returns 0 if entity doesn't have any tokens", () => {
      const entity = ctx.accounts.get("wallet_5")!;
      const amount = 0;

      token.getBalance(entity).expectOk().expectUint(amount);
    });

    it("returns correct balance when entity have some tokens", () => {
      const entity = ctx.accounts.get("wallet_5")!;
      const amount = 200;
      ctx.chain.mineBlock([token.forceMint(amount, entity)]);

      token.getBalance(entity).expectOk().expectUint(amount);
    });
  });

  describe("get-decimals", () => {
    it("returns 0", () => {
      token.getDecimals().expectOk().expectUint(0);
    });
  });

  describe("get-name", () => {
    it("returns 'token'", () => {
      token.getName().expectOk().expectAscii("token");
    });
  });

  describe("get-symbol", () => {
    it("returns 'token'", () => {
      token.getSymbol().expectOk().expectAscii("token");
    });
  });

  describe("get-uri", () => {
    it("returns empty string", () => {
      token.getTokenUri().expectOk().expectSome().expectUtf8("");
    });
  });

  describe("get-total-supply", () => {
    it("returns 0 after deployment", () => {
      token.getTotalSupply().expectOk().expectUint(0);
    });

    it("returns correct value after minting some tokens", () => {
      const amount = 200;
      ctx.chain.mineBlock([token.forceMint(amount, ctx.deployer)]);

      token.getTotalSupply().expectOk().expectUint(amount);
    });
  });

  describe("transfer", () => {
    it("fails when token sender is different then TX sender", () => {
      const amount = 10;
      const from = ctx.accounts.get("wallet_1")!;
      const to = ctx.accounts.get("wallet_2")!;
      const memo = undefined;

      const receipt = ctx.chain.mineBlock([
        token.transfer(amount, from, to, memo, ctx.deployer),
      ]).receipts[0];

      receipt.result.expectErr().expectUint(TokenModel.Err.ERR_NOT_AUTHORIZED);
    });

    it("succeeds when memo is not provided", () => {
      const amount = 100;
      const from = ctx.accounts.get("wallet_1")!;
      const to = ctx.accounts.get("wallet_2")!;
      const memo = undefined;
      ctx.chain.mineBlock([token.forceMint(amount, from)]);

      const receipt = ctx.chain.mineBlock([
        token.transfer(amount, from, to, memo, from),
      ]).receipts[0];

      receipt.result.expectOk().expectBool(true);

      assertEquals(receipt.events.length, 1);

      receipt.events.expectFungibleTokenTransferEvent(
        amount,
        from.address,
        to.address,
        TokenModel.AssetId
      );
    });

    it("succeeds and print memo when provided", () => {
      const amount = 10;
      const from = ctx.accounts.get("wallet_1")!;
      const to = ctx.accounts.get("wallet_2")!;
      const memo = "hello";
      ctx.chain.mineBlock([token.forceMint(amount, from)]);

      const receipt = ctx.chain.mineBlock([
        token.transfer(amount, from, to, memo, from),
      ]).receipts[0];

      receipt.result.expectOk().expectBool(true);

      assertEquals(receipt.events.length, 2);

      receipt.events.expectFungibleTokenTransferEvent(
        amount,
        from.address,
        to.address,
        TokenModel.AssetId
      );

      receipt.events.expectPrintEvent(token.address, types.buff(memo));
    });
  });

  describe("mint", () => {
    it("fails when called by unauthorized principal", () => {
      const amount = 2831;
      const recipient = ctx.accounts.get("wallet_5")!;
      const sender = ctx.accounts.get("wallet_3")!;

      const receipt = ctx.chain.mineBlock([
        token.mint(amount, recipient, sender),
      ]).receipts[0];

      receipt.result.expectErr().expectUint(TokenModel.Err.ERR_NOT_AUTHORIZED);
    });

    it("succeeds and mint desired amount when called by authorized principal", () => {
      const amount = 2831;
      const recipient = ctx.accounts.get("wallet_5")!;
      const sender = ctx.accounts.get("wallet_3")!;
      ctx.chain.mineBlock([
        auth.grant(sender.address, token.address, "mint", ctx.deployer),
      ]);

      const receipt = ctx.chain.mineBlock([
        token.mint(amount, recipient, sender),
      ]).receipts[0];

      receipt.result.expectOk().expectBool(true);
      assertEquals(receipt.events.length, 1);
      receipt.events.expectFungibleTokenMintEvent(
        amount,
        recipient.address,
        TokenModel.AssetId
      );
    });
  });
});

run();
