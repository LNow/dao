(define-constant CONTRACT_OWNER tx-sender)
(define-constant CONTRACT_ADDRESS (as-contract tx-sender))
(define-constant DEPLOYED_AT block-height)

(use-trait task .task-trait.task-trait)

(define-public (create (amount uint) (recipient principal) (task <task>))
  (match (contract-call? .voting new-contract-vote (contract-of task)) voteId
    (begin
      (try! (contract-call? .storage-uint new-value voteId "amount" amount))
      (try! (contract-call? .storage-principal new-value voteId "recipient" recipient))
      (ok voteId)
    )
    errNum (err errNum)
  )
)