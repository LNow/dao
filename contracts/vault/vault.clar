(define-constant CONTRACT_OWNER tx-sender)
(define-constant CONTRACT_ADDRESS (as-contract tx-sender))
(define-constant DEPLOYED_AT block-height)

(define-constant ERR_NOT_AUTHORIZED (err u7002))

(define-public (transfer (amount uint) (recipient principal))
  (begin
    (asserts! (can-call "transfer") ERR_NOT_AUTHORIZED)
    (as-contract (stx-transfer? amount CONTRACT_ADDRESS recipient))
  )
)

(define-private (can-call (what (string-ascii 32)))
  (contract-call? .auth can-call contract-caller CONTRACT_ADDRESS what)
)