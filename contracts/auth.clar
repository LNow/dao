(define-constant CONTRACT_OWNER tx-sender)
(define-constant CONTRACT_ADDRESS (as-contract tx-sender))
(define-constant DEPLOYED_AT block-height)

(define-map Grants
  {who: principal, where: principal, what: (string-ascii 32)}
  bool
)

(define-read-only (can-call (who principal) (where principal) (what (string-ascii 32)))
  (default-to false (map-get? Grants {who: who, what: what, where: where}))
)

(define-public (grant (who principal) (where principal) (what (string-ascii 32)))
  (begin
    (map-set Grants {who: who, what: what, where: where} true)
    (print {EVENT: "grant", who: who, where: where, what: what})
    (ok true)
  )
)