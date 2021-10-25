# Clarity DAO framework

## Main concept
If we want to perform some operation on DAO (e.g. mint token, transfer funds, change grants etc.) we have to open a new vote for it.

Each function that needs voting requires 2 contracts:
 - `vote` - contract responsible for creating new vote and preparing all arguments required by function e.g. `vault-transfer-vote`, `token-mint-vote`
 - `task` - contract responsible for executing function e.g. `vault-transfer-task`, `token-mint-task`


`create` function in `vote` contract takes all parameters required by function we want to vote on + address of `task` contract that later will execute this function.


Because different functions have different arguments it is impossible to create one contract that will let us store all of the. So I created a separate contract for each data type.
If function requires `uint` argument - it needs to be stored in `storage-uint` contract. If it requires `principal` - it needs to be stored in `storage-principal`.
If some function will have `(list 200 uint)` argument, then I'll create `storage-list-200-uint` contract for it.


Main advantage of using `vote`, `task` and `storage` contract is that I can easily make any function vote-able.


Example:

```clojure
;; create first vote to mint 199 tokens to tx-sender
::get_costs (contract-call? .token-mint-vote create u199 tx-sender .token-mint-task)

::advance_chain_tip 1

;; vote yea
(contract-call? .voting vote-yea u1)

;; execute mint function
(contract-call? .token-mint-task execute u1)
::get_assets_maps

;; 2nd vote to mint more tokens - this time we want to mint to someone else
::get_costs (contract-call? .token-mint-vote create 400 'ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0 .token-mint-task)

::advance_chain_tip 1

;; vote yea
(contract-call? .voting vote-yea u2)

;; execute mint function
(contract-call? .token-mint-task execute u2)

::get_assets_maps

;; now let's vote on transfering some funds out of the vault
::get_costs (contract-call? .vault-transfer-vote create u800 'ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ .vault-transfer-task)

::advance_chain_tip 1

;; vote yea
(contract-call? .voting vote-yea u3)

;; end try to execute it - it should throw err u2004, because yea stake must be >=50% of all tokens
(contract-call? .vault-transfer-task execute u3)

;; switch to 2nd account and vote yea
::set_tx_sender ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0
(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.voting vote-yea u3)

;; try to execute again
(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.vault-transfer-task execute u3)

```
