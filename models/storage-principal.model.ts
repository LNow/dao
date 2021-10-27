import { Account, Model, types } from "../deps.ts";

enum Err {
  ERR_VALUE_EXISTS = 6001,
  ERR_NOT_AUTHORIZED = 6002,
}

export class StoragePrincipal extends Model {
  name = "storage-principal";

  static Err = Err;

  getValue(id: number, name: string) {
    return this.callReadOnly("get-value", [types.uint(id), types.ascii(name)])
      .result;
  }

  newValue(id: number, name: string, value: string, sender: Account) {
    return this.callPublic(
      "new-value",
      [types.uint(id), types.ascii(name), types.principal(value)],
      sender
    );
  }
}
