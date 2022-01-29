(define-constant CONTRACT_OWNER tx-sender)
(define-constant CONTRACT_ADDRESS (as-contract tx-sender))
(define-constant DEPLOYED_AT block-height)
(define-constant ERR_NOT_AUTHORIZED (err u4001))

(define-map Grants
  {who: principal, where: principal, what: (string-ascii 32)}
  bool
)

(define-read-only (can-call (who principal) (where principal) (what (string-ascii 32)))
  (default-to false (map-get? Grants {who: who, what: what, where: where}))
)

(define-public (grant (who principal) (where principal) (what (string-ascii 32)))
  (begin
    (asserts! (can-call contract-caller CONTRACT_ADDRESS "grant") ERR_NOT_AUTHORIZED)
    (map-set Grants {who: who, what: what, where: where} true)
    (print {EVENT: "grant", who: who, where: where, what: what})
    (ok true)
  )
)

(define-public (revoke (who principal) (where principal) (what (string-ascii 32)))
  (begin
    (asserts! (can-call contract-caller CONTRACT_ADDRESS "revoke") ERR_NOT_AUTHORIZED)
    (map-set Grants {who: who, what: what, where: where} false)
    (print {EVENT: "revoke", who: who, where: where, what: what})
    (ok true)
  )
)

(map-set Grants {who: CONTRACT_OWNER, where: CONTRACT_ADDRESS, what: "grant"} true)
(map-set Grants {who: CONTRACT_OWNER, where: CONTRACT_ADDRESS, what: "revoke"} true)