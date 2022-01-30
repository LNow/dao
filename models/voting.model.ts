import { Account, Model, types } from "../deps.ts";

enum Err {
  ERR_UNKNOWN_VOTE = 2001,
  ERR_NOT_AUTHORIZED = 2002,
}

export class VotingModel extends Model {
  name = "voting";

  static Err = Err;

  getVote(id: number) {
    return this.callReadOnly("get-vote", [types.uint(id)]).result;
  }

  getVoter(id: number, voter: Account) {
    return this.callReadOnly("get-voter", [
      types.uint(id),
      types.principal(voter.address),
    ]).result;
  }

  newVote(sender: Account) {
    return this.callPublic("new-vote", [], sender);
  }

  newTaskVote(task: string, sender: Account) {
    return this.callPublic("new-task-vote", [types.principal(task)], sender);
  }

  voteYea(id: number, sender: Account) {
    return this.callPublic("vote-yea", [types.uint(id)], sender);
  }

  voteNay(id: number, sender: Account) {
    return this.callPublic("vote-nay", [types.uint(id)], sender);
  }
}
