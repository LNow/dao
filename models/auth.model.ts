import { Account, Model, types } from "../deps.ts";

export class AuthModel extends Model {
  name = "auth";

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
}
