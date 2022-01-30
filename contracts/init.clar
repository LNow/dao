(define-private (grant (who principal) (where principal) (what (string-ascii 32)))
  (contract-call? .auth grant who where what)
)

(stx-transfer? u100000 tx-sender .vault)

;; VAULT
(grant .vault-transfer-vote .voting "new-task-vote")
(grant .vault-transfer-vote .storage-uint "new-value")
(grant .vault-transfer-vote .storage-principal "new-value")

(grant .vault-transfer-task .vault "transfer")
(grant .vault-transfer-task .voting "execute")

;; TOKEN
(grant .token-mint-vote .voting "new-task-vote")
(grant .token-mint-vote .storage-uint "new-value")
(grant .token-mint-vote .storage-principal "new-value")

(grant .token-mint-task .token "mint")
(grant .token-mint-task .voting "execute")