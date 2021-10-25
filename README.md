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
