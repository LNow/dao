import { Account, Model, types } from "../deps.ts";

enum Err {
  ERR_NOT_AUTHORIZED = 1001,
}

export class TokenModel extends Model {
  name = "token";

  static Err = Err;
  static AssetId = "token";

  // test helper function
  forceMint(amount: number, recipient: string | Account) {
    return this.callPublic("force-mint", [
      types.uint(amount),
      types.principal(
        typeof recipient === "string" ? recipient : recipient.address
      ),
    ]);
  }

  getBalance(entity: string | Account) {
    return this.callReadOnly("get-balance", [
      types.principal(typeof entity === "string" ? entity : entity.address),
    ]).result;
  }

  getDecimals() {
    return this.callReadOnly("get-decimals").result;
  }

  getName() {
    return this.callReadOnly("get-name").result;
  }

  getSymbol() {
    return this.callReadOnly("get-symbol").result;
  }

  getTokenUri() {
    return this.callReadOnly("get-token-uri").result;
  }

  getTotalSupply() {
    return this.callReadOnly("get-total-supply").result;
  }

  transfer(
    amount: number,
    from: string | Account,
    to: string | Account,
    memo: string | undefined,
    sender: Account
  ) {
    return this.callPublic(
      "transfer",
      [
        types.uint(amount),
        types.principal(typeof from === "string" ? from : from.address),
        types.principal(typeof to === "string" ? to : to.address),
        typeof memo === "undefined"
          ? types.none()
          : types.some(types.buff(memo)),
      ],
      sender
    );
  }

  mint(amount: number, recipient: string | Account, sender: Account) {
    return this.callPublic(
      "mint",
      [
        types.uint(amount),
        types.principal(
          typeof recipient === "string" ? recipient : recipient.address
        ),
      ],
      sender
    );
  }
}

export interface VoterData {
  support: string;
  stake: string;
}

export interface VoteData {
  yea: string,
  nay: string,
  startAt: string,
  executed: string,
  task: string,
}
