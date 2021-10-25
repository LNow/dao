(define-constant CONTRACT_OWNER tx-sender)
(define-constant CONTRACT_ADDRESS (as-contract tx-sender))
(define-constant DEPLOYED_AT block-height)

(define-constant ERR_NO_VALUE (err u5000))

(impl-trait .task-trait.task-trait)

(define-public (execute (id uint))
  (begin
    (try! (as-contract (contract-call? .token mint
      (unwrap! (contract-call? .storage-uint get-value id "amount") ERR_NO_VALUE)
      (unwrap! (contract-call? .storage-principal get-value id "recipient") ERR_NO_VALUE)
    )))
    (as-contract (contract-call? .voting execute id))
  )
)