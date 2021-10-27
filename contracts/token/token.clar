(define-constant CONTRACT_OWNER tx-sender)
(define-constant CONTRACT_ADDRESS (as-contract tx-sender))
(define-constant DEPLOYED_AT block-height)

(define-constant ERR_NOT_AUTHORIZED (err u1001))

(define-data-var cfgDecimals uint u0)
(define-data-var cfgName (string-ascii 32) "token")
(define-data-var cfgSymbol (string-ascii 32) "token")
(define-data-var cfgTokenUri (optional (string-utf8 256)) (some u""))


(impl-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip-010-trait-ft-standard.sip-010-trait)

(define-fungible-token token)

(define-read-only (get-balance (entity principal))
	(ok (ft-get-balance token entity))
)

(define-read-only (get-decimals)
  (ok (var-get cfgDecimals))
)

(define-read-only (get-name)
	(ok (var-get cfgName))
)

(define-read-only (get-symbol)
	(ok (var-get cfgSymbol))
)

(define-read-only (get-token-uri)
	(ok (var-get cfgTokenUri))
)

(define-read-only (get-total-supply)
	(ok (ft-get-supply token))
)

(define-public (transfer (amount uint) (from principal) (to principal) (memo (optional (buff 34))))
	(begin
  	(asserts! (is-eq from tx-sender) ERR_NOT_AUTHORIZED)
  	(try! (ft-transfer? token amount from to))
  	(match memo to-print (print to-print) 0x)
  	(ok true)
	)
)

(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (can-call "mint") ERR_NOT_AUTHORIZED)
    (ft-mint? token amount recipient)
  )
)

(define-private (can-call (what (string-ascii 32)))
  (contract-call? .auth can-call contract-caller CONTRACT_ADDRESS what)
)

;; test helper function
(define-public (force-mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq DEPLOYED_AT u0) ERR_NOT_AUTHORIZED)
    (ft-mint? token amount recipient)
  )
)