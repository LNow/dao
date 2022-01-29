import { Account, Model, types } from "../deps.ts";

enum Err {
  ERR_NOT_AUTHORIZED = 4001,
}

export class AuthModel extends Model {
  name = "auth";

  static Err = Err;

  canCall(who: string, where: string, what: string) {
    return this.callReadOnly("can-call", [
      types.principal(who),
      types.principal(where),
      types.ascii(what),
    ]).result;
  }

  grant(who: string, where: string, what: string, sender: Account) {
    return this.callPublic(
      "grant",
      [types.principal(who), types.principal(where), types.ascii(what)],
      sender
    );
  }

  revoke(who: string, where: string, what: string, sender: Account) {
    return this.callPublic(
      "revoke",
      [types.principal(who), types.principal(where), types.ascii(what)],
      sender
    )
  }
}
