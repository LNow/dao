(define-constant CONTRACT_OWNER tx-sender)
(define-constant CONTRACT_ADDRESS (as-contract tx-sender))
(define-constant DEPLOYED_AT block-height)

(define-constant ERR_VALUE_EXISTS (err u6001))
(define-constant ERR_NOT_AUTHORIZED (err u6002))

(define-map Storage
  {id: uint, name: (string-ascii 32)}
  uint
)

(define-read-only (get-value (id uint) (name (string-ascii 32)))
  (map-get? Storage {id: id, name: name})
)

(define-public (new-value (id uint) (name (string-ascii 32)) (value uint))
  (begin
    (asserts! (can-call "new-value") ERR_NOT_AUTHORIZED)
    (if (map-insert Storage {id: id, name: name} value)
      (ok true)
      ERR_VALUE_EXISTS
    )
  )
)

(define-private (can-call (what (string-ascii 32)))
  (contract-call? .auth can-call contract-caller CONTRACT_ADDRESS what)
)