# Clarity DAO framework

## Main concepts
Centerpiece of this framework is `auth` contract that stores information about **who** can do **what** and **where**.

By default only deployer of `auth` contract is allowed to `grant` and `revoke` credentials, but he can be stripped from these powers and replaced by voteable contract.

The other contracts in this repository show one of many ways how to build permissionless DAO in which every single activity is voted on.

## Basic `auth` usage
Let's say we want to secure `say-hello` function in `greeter` contract and allow it to be called only by `ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC`.

First we have to create our contract:

```clojure
;; greeter.clar
(define-constant CONTRACT_OWNER tx-sender)
(define-constant CONTRACT_ADDRESS (as-contract tx-sender))
(define-constant DEPLOYED_AT block-height)

(define-constant ERR_NOT_AUTHORIZED (err u1001))

(define-public (say-hello)
  (begin
    (asserts! (can-call "say-hello") ERR_NOT_AUTHORIZED)
    (print "hello world")
  )
)

(define-private (can-call (what (string-ascii 32)))
  (contract-call? .auth can-call contract-caller CONTRACT_ADDRESS what)
)
```
And `auth` deployer must call `grant` function:
`(grant 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC .greeter "say-hello")`

And that's all. From now on only `ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC` will be able to successfully call `say-hello` in our `greeter` contract.

## DAO sample implementation

If we want to perform some operation on DAO (e.g. mint token, transfer funds, change grants etc.) we have to open a new vote for it.

Each function that needs voting requires 2 contracts:
 - `vote` - contract responsible for creating new vote and preparing all arguments required by function e.g. `vault-transfer-vote`, `token-mint-vote`
 - `task` - contract responsible for executing function e.g. `vault-transfer-task`, `token-mint-task`


`create` function in `vote` contract takes all parameters required by function we want to vote on + address of `task` contract that later will execute this function.


Because different functions have different arguments it is impossible to create one contract that will let us store all of the. That is why  in this implementation I used separate contract for each data type.

If function requires `uint` argument - it needs to be stored in `storage-uint` contract. If it requires `principal` - it needs to be stored in `storage-principal`.
If some function will have `(list 200 uint)` argument, then you have to create `storage-list-200-uint` contract for it.


Main advantages of using `auth`, `vote`, `task` and `storage` contracts is that in practice you can make virtually any function voteable, using any voting mechanism that you can build in clarity. This approach also separates logic from access control, so if you want or need to change voting mechanism or grant someone credentials to call function without voting on every single call you can do it easily.


**Executions Example:**

```clojure
;; First we have to grant proper credentials
;; vault-transfer-vote must be able to create new-task-vote and add new-value to storage-uint and storage-principal
(contract-call? .auth grant .vault-transfer-vote .voting "new-task-vote")
(contract-call? .auth grant .vault-transfer-vote .storage-uint "new-value")
(contract-call? .auth grant .vault-transfer-vote .storage-principal "new-value")

;; vault-transfer-taks must be able to transfer funds from vault and execute what was voting on
(contract-call? .auth grant .vault-transfer-task .vault "transfer")
(contract-call? .auth grant .vault-transfer-task .voting "execute")

;; TOKEN
;; token-mint-vote must be able to create new-task-vote and add new-value to storage-uint and storage-principal
(contract-call? .auth grant .token-mint-vote .voting "new-task-vote")
(contract-call? .auth grant .token-mint-vote .storage-uint "new-value")
(contract-call? .auth grant .token-mint-vote .storage-principal "new-value")

;; token-mint-task must be able to mint and execute vote
(contract-call? .auth grant .token-mint-task .token "mint")
(contract-call? .auth grant .token-mint-task .voting "execute")


;; create first vote to mint 199 tokens to tx-sender
::get_costs (contract-call? .token-mint-vote create u199 tx-sender .token-mint-task)

;; user must have at least 1 token to vote so we use force-mint that works only in dev environment
(contract-call? .token force-mint u1 tx-sender)

::advance_chain_tip 1

;; vote yea
(contract-call? .voting vote-yea u1)

;; execute mint function with parameters we set in previous steps
(contract-call? .token-mint-task execute u1)
::get_assets_maps

;; 2nd vote to mint more tokens - this time we want to mint to someone else
::get_costs (contract-call? .token-mint-vote create u400 'ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0 .token-mint-task)

::advance_chain_tip 1

;; vote yea
(contract-call? .voting vote-yea u2)

;; execute mint function
(contract-call? .token-mint-task execute u2)

::get_assets_maps

;; now let's add some funds to vault and create vote to transfer them out of it
(stx-transfer? u800 tx-sender .vault)
::get_assets_maps
::get_costs (contract-call? .vault-transfer-vote create u800 'ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ .vault-transfer-task)

::advance_chain_tip 1

;; vote yea
(contract-call? .voting vote-yea u3)

;; try to execute it - it should throw err u2004, because yea stake must be >=50% of all tokens and we have only 200 out of 600
(contract-call? .vault-transfer-task execute u3)

;; switch to 2nd account and vote yea
::set_tx_sender ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0
(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.voting vote-yea u3)

;; try to execute again
(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.vault-transfer-task execute u3)

```

This mechanic can be used to control anything build in clarity granting, revoking credentials, minting tokens, burning tokens, transferring tokens, enabling/disabling various features, upgrading contracts, stacking, staking, virtually anything build in Clarity.
