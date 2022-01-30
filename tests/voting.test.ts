import { describe, it, run, Context, beforeEach } from "../deps.ts";
import { AuthModel } from "../models/auth.model.ts";
import { VotingModel } from "../models/voting.model.ts";
import { VoterData, TokenModel, VoteData } from "../models/token.model.ts";

let ctx: Context;
let auth: AuthModel;
let voting: VotingModel;
let token: TokenModel;

beforeEach(() => {
  ctx = new Context();
  auth = ctx.models.get(AuthModel);
  voting = ctx.models.get(VotingModel);
  token = ctx.models.get(TokenModel);

  // move chain forward to make tests more realistic
  ctx.chain.mineEmptyBlock(2215);
});

describe("[Voting]", () => {
  describe("get-vote", () => {
    it("returns none when asked for unknown data", () => {
      const id = 8383;

      // act
      const result = voting.getVote(id);

      // assert
      result.expectNone();
    });
  });

  describe("get-voter", () => {
    it("returns none when asked for unknown data", () => {
      const id = 3244;
      const voter = ctx.accounts.get("wallet_2")!;

      // act
      const result = voting.getVoter(id, voter);

      // assert
      result.expectNone();
    });
  });

  describe("new-vote", () => {
    it("fails when called by unauthorized principal", () => {
      const sender = ctx.accounts.get("wallet_2")!;

      // act
      const receipt = ctx.chain.mineBlock([voting.newVote(sender)]).receipts[0];

      /// assert
      receipt.result.expectErr().expectUint(VotingModel.Err.ERR_NOT_AUTHORIZED);
    });

    it("creates new vote and returns its id when called by authorized principal", () => {
      const sender = ctx.accounts.get("wallet_2")!;
      const id = 1;
      ctx.chain.mineBlock([
        auth.grant(sender.address, voting.address, "new-vote", ctx.deployer),
      ]);

      // act
      const receipt = ctx.chain.mineBlock([voting.newVote(sender)]).receipts[0];

      // assert
      receipt.result.expectOk().expectUint(id);

      voting.getVote(id).expectSome();
    });
  });

  describe("vote-yea", () => {
    it("fails for unknown vote", () => {
      const id = 123;
      const voter = ctx.accounts.get("wallet_7")!;

      // act
      const receipt = ctx.chain.mineBlock([voting.voteYea(id, voter)])
        .receipts[0];

      // assert
      receipt.result.expectErr().expectUint(VotingModel.Err.ERR_UNKNOWN_VOTE);
    });

    it("fails when user don't have governance tokens", () => {
      const id = 1;
      const voter = ctx.accounts.get("wallet_3")!;
      ctx.chain.mineBlock([
        auth.grant(
          ctx.deployer.address,
          voting.address,
          "new-vote",
          ctx.deployer
        ),
        voting.newVote(ctx.deployer),
      ]);

      // act
      const receipt = ctx.chain.mineBlock([voting.voteYea(id, voter)])
        .receipts[0];

      // assert
      receipt.result.expectErr().expectUint(VotingModel.Err.ERR_NOT_AUTHORIZED);
    });

    it("succeeds and register vote when user have governance tokens", () => {
      const id = 1;
      const amount = 10;
      const voter = ctx.accounts.get("wallet_3")!;
      ctx.chain.mineBlock([
        auth.grant(
          ctx.deployer.address,
          voting.address,
          "new-vote",
          ctx.deployer
        ),
        voting.newVote(ctx.deployer),
        token.forceMint(amount, voter),
      ]);

      // act
      const receipt = ctx.chain.mineBlock([voting.voteYea(id, voter)])
        .receipts[0];

      // assert
      receipt.result.expectOk().expectBool(true);

      const voterData = <VoterData>(
        voting.getVoter(id, voter).expectSome().expectTuple()
      );
      voterData.stake.expectUint(amount);
      voterData.support.expectBool(true);

      const voteData = <VoteData>voting.getVote(id).expectSome().expectTuple();
      voteData.yea.expectUint(amount);
    });

    it("succeeds when voting 2nd time but doesn't change voting result", () => {
      const id = 1;
      const amount = 10;
      const voter = ctx.accounts.get("wallet_3")!;
      const tx = voting.voteYea(id, voter);
      ctx.chain.mineBlock([
        auth.grant(
          ctx.deployer.address,
          voting.address,
          "new-vote",
          ctx.deployer
        ),
        voting.newVote(ctx.deployer),
        token.forceMint(amount, voter),
        tx,
      ]);

      const receipt = ctx.chain.mineBlock([tx]).receipts[0];

      receipt.result.expectOk().expectBool(true);

      const voterData = <VoterData>(
        voting.getVoter(id, voter).expectSome().expectTuple()
      );
      voterData.stake.expectUint(amount);
      voterData.support.expectBool(true);

      const voteData = <VoteData>voting.getVote(id).expectSome().expectTuple();
      voteData.yea.expectUint(amount);
    });

    it("registers vote using amount user had when vote was created if now he/she have more", () => {
      const id = 1;
      const amount = 10;
      const voter = ctx.accounts.get("wallet_4")!;
      ctx.chain.mineBlock([
        auth.grant(
          ctx.deployer.address,
          voting.address,
          "new-vote",
          ctx.deployer
        ),
        voting.newVote(ctx.deployer),
        token.forceMint(amount, voter),
      ]);

      // act
      const receipt = ctx.chain.mineBlock([
        token.forceMint(amount, voter),
        voting.voteYea(id, voter),
      ]).receipts[1];

      // assert
      receipt.result.expectOk().expectBool(true);

      const voterData = <VoterData>(
        voting.getVoter(id, voter).expectSome().expectTuple()
      );
      voterData.stake.expectUint(amount);
      voterData.support.expectBool(true);

      const voteData = <VoteData>voting.getVote(id).expectSome().expectTuple();
      voteData.yea.expectUint(amount);
    });

    it("flips voting result if voter previously voted nay", () => {
      const id = 1;
      const voter = ctx.accounts.get("wallet_9")!;
      const amount = 25;
      ctx.chain.mineBlock([
        auth.grant(
          ctx.deployer.address,
          voting.address,
          "new-vote",
          ctx.deployer
        ),
        voting.newVote(ctx.deployer),
        token.forceMint(amount, voter),
        voting.voteNay(id, voter),
      ]);

      // act
      const receipt = ctx.chain.mineBlock([voting.voteYea(id, voter)])
        .receipts[0];

      // assert
      receipt.result.expectOk().expectBool(true);

      const voterData = <VoterData>(
        voting.getVoter(id, voter).expectSome().expectTuple()
      );
      voterData.stake.expectUint(amount);
      voterData.support.expectBool(true);

      const voteData = <VoteData>voting.getVote(id).expectSome().expectTuple();
      voteData.yea.expectUint(amount);
      voteData.nay.expectUint(0);
    });
  });

  describe("vote-nay", () => {
    it("fails when for unknown", () => {
      const id = 8125645;
      const voter = ctx.accounts.get("wallet_7")!;

      // act
      const receipt = ctx.chain.mineBlock([voting.voteNay(id, voter)])
        .receipts[0];

      // assert
      receipt.result.expectErr().expectUint(VotingModel.Err.ERR_UNKNOWN_VOTE);
    });

    it("fails when user don't have governance tokens", () => {
      const id = 1;
      const voter = ctx.accounts.get("wallet_4")!;
      ctx.chain.mineBlock([
        auth.grant(
          ctx.deployer.address,
          voting.address,
          "new-vote",
          ctx.deployer
        ),
        voting.newVote(ctx.deployer),
      ]);

      const receipt = ctx.chain.mineBlock([voting.voteNay(id, voter)])
        .receipts[0];

      receipt.result.expectErr().expectUint(VotingModel.Err.ERR_NOT_AUTHORIZED);
    });

    it("succeeds and register vote when user have governance tokens", () => {
      const id = 1;
      const amount = 10;
      const voter = ctx.accounts.get("wallet_3")!;
      ctx.chain.mineBlock([
        auth.grant(
          ctx.deployer.address,
          voting.address,
          "new-vote",
          ctx.deployer
        ),
        voting.newVote(ctx.deployer),
        token.forceMint(amount, voter),
      ]);

      // act
      const receipt = ctx.chain.mineBlock([voting.voteNay(id, voter)])
        .receipts[0];

      // assert
      receipt.result.expectOk().expectBool(true);

      const voterData = <VoterData>(
        voting.getVoter(id, voter).expectSome().expectTuple()
      );
      voterData.stake.expectUint(amount);
      voterData.support.expectBool(false);

      const voteData = <VoteData>voting.getVote(id).expectSome().expectTuple();
      voteData.nay.expectUint(amount);
    });

    it("succeeds when voting 2nd time but doesn't change voting result", () => {
      const id = 1;
      const amount = 10;
      const voter = ctx.accounts.get("wallet_2")!;
      const tx = voting.voteNay(id, voter);

      ctx.chain.mineBlock([
        auth.grant(
          ctx.deployer.address,
          voting.address,
          "new-vote",
          ctx.deployer
        ),
        voting.newVote(ctx.deployer),
        token.forceMint(amount, voter),
        tx,
      ]);

      // act
      const receipt = ctx.chain.mineBlock([tx]).receipts[0];

      // assert
      receipt.result.expectOk().expectBool(true);

      const voterData = <VoterData>(
        voting.getVoter(id, voter).expectSome().expectTuple()
      );
      voterData.stake.expectUint(amount);
      voterData.support.expectBool(false);

      const voteData = <VoteData>voting.getVote(id).expectSome().expectTuple();
      voteData.nay.expectUint(amount);
    });

    it("registers vote using amount user had when vote was created if now he/she have more", () => {
      const id = 1;
      const amount = 10;
      const voter = ctx.accounts.get("wallet_4")!;
      ctx.chain.mineBlock([
        auth.grant(
          ctx.deployer.address,
          voting.address,
          "new-vote",
          ctx.deployer
        ),
        voting.newVote(ctx.deployer),
        token.forceMint(amount, voter),
      ]);

      // act
      const receipt = ctx.chain.mineBlock([
        token.forceMint(amount, voter),
        voting.voteNay(id, voter),
      ]).receipts[1];

      // assert
      receipt.result.expectOk().expectBool(true);

      const voterData = <VoterData>(
        voting.getVoter(id, voter).expectSome().expectTuple()
      );
      voterData.stake.expectUint(amount);
      voterData.support.expectBool(false);

      const voteData = <VoteData>voting.getVote(id).expectSome().expectTuple();
      voteData.nay.expectUint(amount);
    });

    it("flips voting result if voter previously voted yea", () => {
      const id = 1;
      const voter = ctx.accounts.get("wallet_9")!;
      const amount = 25;
      ctx.chain.mineBlock([
        auth.grant(
          ctx.deployer.address,
          voting.address,
          "new-vote",
          ctx.deployer
        ),
        voting.newVote(ctx.deployer),
        token.forceMint(amount, voter),
        voting.voteYea(id, voter),
      ]);

      // act
      const receipt = ctx.chain.mineBlock([voting.voteNay(id, voter)])
        .receipts[0];

      // assert
      receipt.result.expectOk().expectBool(true);

      const voterData = <VoterData>(
        voting.getVoter(id, voter).expectSome().expectTuple()
      );
      voterData.stake.expectUint(amount);
      voterData.support.expectBool(false);

      const voteData = <VoteData>voting.getVote(id).expectSome().expectTuple();
      voteData.yea.expectUint(0);
      voteData.nay.expectUint(amount);
    });
  });

  describe("new-task-vote", () => {
    it("fails when called by unauthorized principal", () => {
      const sender = ctx.accounts.get("wallet_4")!;

      // act
      const receipt = ctx.chain.mineBlock([
        voting.newTaskVote(auth.address, sender),
      ]).receipts[0];

      // assert
      receipt.result.expectErr().expectUint(VotingModel.Err.ERR_NOT_AUTHORIZED);
    });

    it("succeeds when called by authorized principal", () => () => {
      const sender = ctx.accounts.get("wallet_4")!;
      const id = 1;
      ctx.chain.mineBlock([
        auth.grant(
          sender.address,
          voting.address,
          "new-task-vote",
          ctx.deployer
        ),
      ]);

      // act
      const receipt = ctx.chain.mineBlock([
        voting.newTaskVote(auth.address, sender),
      ]).receipts[0];

      // assert
      receipt.result.expectOk().expectUint(id);
      const voteData = <VoteData>voting.getVote(id).expectSome().expectTuple();
      voteData.task.expectSome().expectPrincipal(sender.address);
    });
  });
});

run();
