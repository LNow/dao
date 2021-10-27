import { Account, Chain, Tx } from "../clarinet/index.ts";

export abstract class Model {
  abstract readonly name: string;

  constructor(readonly chain: Chain, readonly deployer: Account) {}

  get address(): string {
    return `${this.deployer.address}.${this.name}`;
  }

  callReadOnly(
    method: string,
    args: Array<any> = [],
    sender: Account = this.deployer
  ) {
    return this.chain.callReadOnlyFn(
      this.address,
      method,
      args,
      sender.address
    );
  }

  callPublic(
    method: string,
    args: Array<any> = [],
    sender: Account = this.deployer
  ) {
    return Tx.contractCall(this.address, method, args, sender.address);
  }
}

export class Models {
  constructor(readonly chain: Chain, readonly deployer: Account) {}

  get<T extends Model>(type: { new (chain: Chain, deployer: Account): T }): T {
    return new type(this.chain, this.deployer);
  }
}
