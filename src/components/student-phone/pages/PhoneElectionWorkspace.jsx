import { useState } from "react"
import { AlertTriangle, CalendarClock, Check, CircleCheck, Mail, Trophy, UserRound, Vote } from "lucide-react"
import { EmptyCard, Lead, Pill, Row } from "../kit/ListBits"
import PhoneSheet from "../kit/PhoneSheet"

const when = (value) => (value ? new Date(value).toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "")

const NOMINATION = {
  submitted: { tone: "info", label: "Submitted" },
  verified: { tone: "success", label: "Approved" },
  modification_requested: { tone: "warning", label: "Changes requested" },
  rejected: { tone: "danger", label: "Rejected" },
  withdrawn: { tone: "neutral", label: "Withdrawn" },
}

const percent = (votes, total) => (Number(total) > 0 ? Math.round((Number(votes || 0) / Number(total)) * 1000) / 10 : 0)

/** Posts you can stand for: tap one to fill or update your nomination. */
const Nominations = ({ election, openNominationModal, withdrawNomination, busyKey }) => {
  const posts = election.posts || []
  const canWithdraw = election.currentStage === "withdrawal"
  if (posts.length === 0) return <EmptyCard icon={UserRound} title="No posts open to you" text="None of this election's posts take nominations from your batch." />
  return (
    <>
      <p className="mk-lede">Tap a post to file your nomination. You'll need your ID card uploaded and the roll numbers of your proposers and seconders.</p>
      <ul className="mk-list mk-list--wrap">
        {posts.map((post) => {
          const mine = post.myNomination
          const state = mine ? NOMINATION[mine.status] || { tone: "info", label: mine.status } : null
          const supporters = mine?.supporterSummary?.total ? `${mine.supporterSummary.accepted || 0} of ${mine.supporterSummary.total} supporters confirmed` : ""
          return (
            <li key={post.id}>
              <Row
                lead={<Lead icon={UserRound} tone={state?.tone === "neutral" ? "info" : state?.tone || "info"} />}
                title={post.title}
                meta={mine ? null : "Not filed yet"}
                onClick={() => openNominationModal(election, post)}
              >
                {mine && (
                  <span className="mk-row__status">
                    <Pill tone={state.tone}>{state.label}</Pill>
                    {supporters && <span className="mk-row__meta">{supporters}</span>}
                  </span>
                )}
                {mine?.review?.notes && <span className="me-note">Note from the election office: {mine.review.notes}</span>}
              </Row>
              {canWithdraw && mine && mine.status !== "withdrawn" && (
                <button
                  type="button"
                  className="mk-btn mk-btn--ghost mk-btn--sm me-withdraw"
                  disabled={busyKey === `withdraw:${election.id}:${mine.id}`}
                  onClick={() => withdrawNomination(election.id, mine.id)}
                >
                  Withdraw from {post.title}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </>
  )
}

/** One card per post with its candidates; one Submit for the whole ballot. */
const Ballot = ({ election, voteSelections, setVoteSelections, submitStudentVotes, busyKey }) => {
  const [reviewing, setReviewing] = useState(false)
  const mode = String(election?.votingAccess?.mode || "both")
  const posts = election.posts || []
  const voted = posts.some((post) => post.hasVoted)
  if (!["portal", "both"].includes(mode)) {
    return <EmptyCard icon={Mail} title="Vote from your email" text="This election sends each voter a personal voting link by email. Check your institute inbox." />
  }
  if (voted) {
    return (
      <>
        <div className="mc-note" data-tone="success">
          <p className="mc-text">
            <strong>Your vote is in.</strong> Votes are secret and can't be changed.
          </p>
        </div>
        <ul className="mk-list">
          {posts.map((post) => (
            <li key={post.id || post.postId}>
              <Row lead={<Lead icon={post.hasVoted ? Check : Vote} tone={post.hasVoted ? "success" : "warning"} />} title={post.title} meta={post.hasVoted ? "Vote recorded" : "No vote recorded"} />
            </li>
          ))}
        </ul>
      </>
    )
  }
  const keyOf = (post) => `${election.id}:${post.id || post.postId}`
  const nameOf = (candidate) => candidate.candidateName || candidate.candidateUserId?.name || candidate.candidateRollNumber
  const pickOf = (post) => (post.votingCandidates || []).find((candidate) => String(candidate.id || candidate.nominationId) === voteSelections[keyOf(post)])
  const chosen = posts.filter((post) => pickOf(post)).length
  const ready = posts.length > 0 && chosen === posts.length
  const busy = busyKey === `vote:${election.id}`
  return (
    <>
      <p className="mk-lede">
        Pick one option for each post (or NOTA, none of the above), check your choices, then cast your vote. {mode === "both" ? "You can also vote from the link in your email. " : ""}You can only vote once.
      </p>
      {posts.map((post, index) => (
        <fieldset key={post.id || post.postId} className="mk-card me-post">
          <legend className="me-post__title">
            <span className="me-post__step">
              Post {index + 1} of {posts.length}
            </span>
            {post.title}
          </legend>
          {(post.votingCandidates || []).map((candidate) => {
            const id = String(candidate.id || candidate.nominationId)
            const on = voteSelections[keyOf(post)] === id
            return (
              <label key={id} className="me-choice" data-on={on || undefined}>
                <input type="radio" name={`vote-${keyOf(post)}`} checked={on} onChange={() => setVoteSelections((current) => ({ ...current, [keyOf(post)]: id }))} />
                <span className="me-choice__name">
                  {nameOf(candidate)}
                  {candidate.isNota ? <small>None of the above</small> : candidate.candidateRollNumber && <small>{candidate.candidateRollNumber}</small>}
                </span>
              </label>
            )
          })}
        </fieldset>
      ))}
      <section className="mk-card me-cast" data-ready={ready || undefined}>
        <div className="me-cast__text">
          <p className="me-cast__count">
            <strong>
              {chosen} of {posts.length}
            </strong>{" "}
            posts picked
          </p>
        </div>
        <button type="button" className="mk-btn mk-btn--primary" disabled={!ready || busy} onClick={() => setReviewing(true)}>
          {busy ? "Casting…" : "Review vote"}
        </button>
      </section>
      {reviewing && (
        <PhoneSheet
          title="Cast your vote?"
          onClose={() => setReviewing(false)}
          footer={
            <>
              <button type="button" className="mk-btn mk-btn--soft" onClick={() => setReviewing(false)}>
                Edit choices
              </button>
              <button
                type="button"
                className="mk-btn mk-btn--primary"
                disabled={busy}
                onClick={() => {
                  setReviewing(false)
                  submitStudentVotes(election.id, posts)
                }}
              >
                Cast vote
              </button>
            </>
          }
        >
          <ul className="me-review">
            {posts.map((post) => (
              <li key={post.id || post.postId}>
                <span className="mk-sub">{post.title}</span>
                <strong>{pickOf(post)?.isNota ? "None of the above (NOTA)" : nameOf(pickOf(post) || {})}</strong>
                {!pickOf(post)?.isNota && pickOf(post)?.candidateRollNumber && <span className="mk-sub">{pickOf(post).candidateRollNumber}</span>}
              </li>
            ))}
          </ul>
          <div className="mc-note me-final" data-tone="warning">
            <AlertTriangle size={18} aria-hidden="true" />
            <p className="mc-text">
              <strong>You can't change your vote after casting it.</strong> Votes are secret.
            </p>
          </div>
        </PhoneSheet>
      )}
    </>
  )
}

/** Published results, winner first, with vote shares when the office shows them. */
const Results = ({ election }) => {
  if (!election.results?.isPublished) return <EmptyCard icon={CalendarClock} title="Results aren't out yet" text="Voting has closed. Results show here as soon as the election office publishes them." />
  return (election.results.posts || []).map((post) => {
    const showVotes = post.showVoteCountToStudents !== false
    const winners = new Set((post.publishedWinnerNominationIds || []).map(String))
    const ranked = showVotes ? [...(post.candidates || [])].sort((a, b) => Number(b.voteCount || 0) - Number(a.voteCount || 0)) : post.candidates || []
    return (
      <section key={post.postId} className="mk-card me-result">
        <div className="me-result__head">
          <h2 className="me-post__title">{post.postTitle}</h2>
          <span className="mk-sub">{showVotes ? `${Number(post.totalVotes || 0).toLocaleString("en-IN")} votes` : "Vote counts not shown"}</span>
        </div>
        <ol className="me-ranks">
          {ranked.map((candidate) => {
            const won = winners.has(String(candidate.nominationId))
            const share = percent(candidate.voteCount, post.totalVotes)
            return (
              <li key={candidate.nominationId} className="me-rank" data-won={won || undefined} data-nota={candidate.isNota || undefined}>
                <span className="me-rank__line">
                  <span className="me-rank__name">
                    {won && <Trophy size={15} aria-hidden="true" />}
                    {candidate.isNota ? "None of the above (NOTA)" : candidate.candidateName}
                    {won && <span className="me-rank__won">{post.publishedWinnerIsTie ? "Tied" : "Winner"}</span>}
                  </span>
                  {showVotes && (
                    <span className="me-rank__votes">
                      {Number(candidate.voteCount || 0).toLocaleString("en-IN")} {Number(candidate.voteCount) === 1 ? "vote" : "votes"} · {share}%
                    </span>
                  )}
                </span>
                {showVotes && (
                  <span className="me-rank__bar" aria-hidden="true">
                    <span style={{ width: `${share}%` }} />
                  </span>
                )}
              </li>
            )
          })}
        </ol>
        {post.publishedWinnerIsTie && <p className="mk-sub">This post ended in a tie.</p>}
      </section>
    )
  })
}

const STAGE_LINE = {
  upcoming: (e) => (e.timeline?.votingStartAt ? `Voting opens ${when(e.timeline.votingStartAt)}` : "Voting date to be announced"),
  participation: (e) =>
    e.currentStage === "withdrawal"
      ? e.timeline?.withdrawalEndAt
        ? `Nominations are closed. You can withdraw until ${when(e.timeline.withdrawalEndAt)}.`
        : "Nominations are closed. Withdrawal deadline to be announced."
      : e.timeline?.nominationEndAt
        ? `Nominations close ${when(e.timeline.nominationEndAt)}`
        : "Nomination deadline to be announced",
  voting: (e) => (e.timeline?.votingEndAt ? `Voting closes ${when(e.timeline.votingEndAt)}` : "Voting is open"),
  results: (e) => (e.results?.isPublished ? "Results are out" : "Voting has closed"),
}

/**
 * The student election workspace for the phone app: the same data and
 * actions as the desktop StudentElectionWorkspace, laid out as cards.
 */
const PhoneElectionWorkspace = ({ selectedStudentElection: election, ...actions }) => (
  <>
    <section className="me-hero" data-mode={election.mode}>
      <span className="me-hero__icon" aria-hidden="true">
        {election.mode === "results" ? <Trophy size={22} /> : election.mode === "voting" ? <Vote size={22} /> : <CircleCheck size={22} />}
      </span>
      <span className="me-hero__text">
        <strong>{election.title}</strong>
        <span>{(STAGE_LINE[election.mode] || (() => ""))(election)}</span>
      </span>
    </section>
    {election.mode === "upcoming" && <EmptyCard icon={CalendarClock} title="Voting hasn't started" text={election.timeline?.votingStartAt ? `Come back ${when(election.timeline.votingStartAt)} to vote.` : "The voting date will be announced. Your Home screen tells you when voting opens."} />}
    {election.mode === "participation" && <Nominations election={election} {...actions} />}
    {election.mode === "voting" && <Ballot election={election} {...actions} />}
    {election.mode === "results" && <Results election={election} />}
  </>
)

export default PhoneElectionWorkspace
