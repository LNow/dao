(define-constant CONTRACT_OWNER tx-sender)
(define-constant CONTRACT_ADDRESS (as-contract tx-sender))
(define-constant DEPLOYED_AT block-height)

(define-constant ERR_INTERNAL (err u2000))
(define-constant ERR_UNKNOWN_VOTE (err u2001))
(define-constant ERR_NOT_AUTHORIZED (err u2002))
(define-constant ERR_ALREADY_EXECUTED (err u2003))
(define-constant ERR_CONSENSUS_NOT_REACHED (err u2004))

(define-data-var cfgConsensusThreshold uint u50)

(define-data-var lastVoteId uint u0)
(define-map Votes
  uint ;; voteId
  {
    yea: uint,
    nay: uint,
    startAt: uint,
    executed: bool,
    task: (optional principal)
  }
)

(define-map Voters
  {id: uint, voter: principal}
  {support: bool, stake: uint}
)

(define-read-only (get-vote (id uint))
  (map-get? Votes id)
)

(define-read-only (get-voter (id uint) (voter principal))
  (map-get? Voters {id: id, voter: voter})
)

(define-public (new-vote)
  (let
    ((newId (+ (var-get lastVoteId) u1)))
    (map-set Votes newId {
      yea: u0,
      nay: u0,
      startAt: block-height,
      executed: false,
      task: none
    })
    (asserts! (can-call "new-vote") ERR_NOT_AUTHORIZED)
    (var-set lastVoteId newId)
    (print {EVENT: "new-vote", id: newId})
    (ok newId)
  )
)

(define-public (new-contract-vote (task principal))
  (let
    ((newId (+ (var-get lastVoteId) u1)))
    (map-set Votes newId {
      yea: u0,
      nay: u0,
      startAt: block-height,
      executed: false,
      task: (some task)
    })
    (asserts! (can-call "new-contract-vote") ERR_NOT_AUTHORIZED)
    (var-set lastVoteId newId)
    (print {EVENT: "new-vote", id: newId})
    (ok newId)
  )
)

(define-public (vote-yea (id uint))
  (vote id true)
)

(define-public (vote-nay (id uint))
  (vote id false)
)

(define-private (vote (id uint) (support bool))
  (let
    (
      (data (unwrap! (get-vote id) ERR_UNKNOWN_VOTE))
      (stake (get-stake tx-sender (get startAt data)))
    )
    (asserts! (> stake u0) ERR_NOT_AUTHORIZED)
    (match (get-voter id tx-sender) prev
      ;; voted previously
      (map-set Votes id (merge data
        {
          yea: (- (if support (+ (get yea data) stake) (get yea data)) (if (get support prev) (get stake prev) u0)),
          nay: (- (if (not support) (+ (get nay data) stake) (get nay data)) (if (not (get support prev)) (get stake prev) u0)),
        }
      ))
      ;; no prev vote
      (map-set Votes id (merge data
        {
          yea: (if support (+ (get yea data) stake) (get yea data)),
          nay: (if (not support) (+ (get nay data) stake) (get nay data)),
        }
      ))
    )
    (map-set Voters {id: id, voter: tx-sender} {support: support, stake: stake})
    (ok true)
  )
)

(define-public (execute (id uint))
  (let
    ((data (unwrap! (get-vote id) ERR_UNKNOWN_VOTE)))
    (asserts! (not (get executed data)) ERR_ALREADY_EXECUTED)
    (asserts! (and (is-eq (unwrap-panic (get task data)) contract-caller) (can-call "execute")) ERR_NOT_AUTHORIZED)
    ;; yea stake / total possible stake
    (asserts! (>= (/ (* (get yea data) u100) (get-token-supply-at (get startAt data))) (var-get cfgConsensusThreshold)) ERR_CONSENSUS_NOT_REACHED)

    (map-set Votes id (merge data {executed: true}))

    (print contract-caller)
    (print {EVENT: "execute", id: id})
    (ok true)
  )
)

(define-private (can-call (what (string-ascii 32)))
  (contract-call? .auth can-call contract-caller CONTRACT_ADDRESS what)
)

(define-private (get-token-supply)
  (unwrap-panic (contract-call? .token get-total-supply))
)

(define-read-only (get-token-supply-at (block uint))
  (match (get-block-info? id-header-hash block)
    header-hash (unwrap! (at-block header-hash (contract-call? .token get-total-supply)) u0)
    u0
  )
)

(define-private (get-balance (who principal))
  (unwrap-panic (contract-call? .token get-balance who))
)

(define-read-only (get-balance-at (who principal) (block uint))
  (match (get-block-info? id-header-hash block)
    header-hash (unwrap! (at-block header-hash (contract-call? .token get-balance who)) u0)
    u0
  )
)

(define-read-only (get-stake (who principal) (block uint))
  (let
    (
      (current (get-balance who))
      (atBlock (get-balance-at who block))
    )
    (if (< atBlock current) atBlock current)
  )
)