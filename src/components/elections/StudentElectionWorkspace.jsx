import { Button, DataTable } from "czero/react"
import { Alert } from "@/components/ui/feedback"
import { StatusPill } from "@/components/elections/ElectionShared"

const formatVotePercentage = (voteCount, totalVotes) => {
  const votes = Number(voteCount || 0)
  const total = Number(totalVotes || 0)
  if (total <= 0) return "0%"

  const percentage = (votes / total) * 100
  return percentage >= 10 ? `${percentage.toFixed(1)}%` : `${percentage.toFixed(2)}%`
}

const StudentElectionWorkspace = ({
  selectedStudentElection,
  openNominationModal,
  withdrawNomination,
  busyKey,
  voteSelections,
  setVoteSelections,
  submitStudentVotes,
  infoBannerStyle,
  detailPanelStyle,
  mutedTextStyle,
  formatStageLabel,
  formatDateTime,
  pillBaseStyle,
  statusToneStyles,
}) => {
  const votingAccessMode = String(selectedStudentElection?.votingAccess?.mode || "both")
  const portalVotingEnabled = ["portal", "both"].includes(votingAccessMode)
  const emailVotingEnabled = ["email", "both"].includes(votingAccessMode)
  const votingPosts = selectedStudentElection?.posts || []
  const submittedVotingPosts = votingPosts.filter((post) => Boolean(post.hasVoted))
  const hasSubmittedVote =
    selectedStudentElection.mode === "voting" &&
    submittedVotingPosts.length > 0

  return (
    <>
    <div style={infoBannerStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)" }}>
          {selectedStudentElection.title}
        </h2>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
          color: "var(--color-text-muted)",
          fontSize: "var(--font-size-sm)",
        }}
      >
        {selectedStudentElection.mode === "upcoming" ? (
          <span>
            <strong>Voting starts:</strong> {formatDateTime(selectedStudentElection.timeline?.votingStartAt)}
          </span>
        ) : null}
        {selectedStudentElection.mode === "voting" ? (
          <span>
            <strong>Voting:</strong> {formatDateTime(selectedStudentElection.timeline?.votingStartAt)} –{" "}
            {formatDateTime(selectedStudentElection.timeline?.votingEndAt)}
          </span>
        ) : null}
        {selectedStudentElection.mode === "results" ? (
          <span>
            <strong>Status:</strong>{" "}
            {selectedStudentElection.results?.isPublished ? "Published" : "Publishing soon"}
          </span>
        ) : null}
      </div>
    </div>

    {selectedStudentElection.mode === "upcoming" ? (
      <div
        style={{
          border: "1px solid var(--color-border-primary)",
          borderRadius: "var(--radius-xl)",
          backgroundColor: "var(--color-bg-secondary)",
          padding: "var(--spacing-5)",
          color: "var(--color-text-body)",
        }}
      >
        Voting will start on <strong>{formatDateTime(selectedStudentElection.timeline?.votingStartAt)}</strong>.
      </div>
    ) : selectedStudentElection.mode === "participation" ? (
      <DataTable
        data={selectedStudentElection.posts || []}
        emptyMessage="No posts are available for nomination right now."
        onRowClick={(post) => openNominationModal(selectedStudentElection, post)}
        columns={[
          {
            header: "Post",
            key: "title",
            render: (post) => (
              <div style={{ display: "grid", gap: "4px" }}>
                <div style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }}>
                  {post.title}
                </div>
                <div style={mutedTextStyle}>
                  {formatStageLabel(post.category)}
                  {post.code ? ` · ${post.code}` : ""}
                </div>
              </div>
            ),
          },
          {
            header: "Status",
            key: "status",
            render: (post) => (
              <div style={{ display: "grid", gap: "6px" }}>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                  <StatusPill
                    tone={
                      post.myNomination
                        ? post.myNomination.status === "modification_requested"
                          ? "warning"
                          : post.myNomination.status === "verified"
                            ? "success"
                            : post.myNomination.status === "rejected"
                              ? "danger"
                              : "primary"
                        : "default"
                    }
                    pillBaseStyle={pillBaseStyle}
                    statusToneStyles={statusToneStyles}
                  >
                    {post.myNomination
                      ? `Nomination ${formatStageLabel(post.myNomination.status)}`
                      : "Not submitted"}
                  </StatusPill>
                  {post.myNomination?.review?.notes ? (
                    <StatusPill
                      tone="warning"
                      pillBaseStyle={pillBaseStyle}
                      statusToneStyles={statusToneStyles}
                    >
                      Comment Available
                    </StatusPill>
                  ) : null}
                  {selectedStudentElection.currentStage === "withdrawal" &&
                  post.myNomination &&
                  post.myNomination.status !== "withdrawn" ? (
                    <Button
                      size="sm"
                      variant="danger"
                      loading={busyKey === `withdraw:${selectedStudentElection.id}:${post.myNomination.id}`}
                      onClick={(event) => {
                        event.stopPropagation()
                        withdrawNomination(selectedStudentElection.id, post.myNomination.id)
                      }}
                    >
                      Withdraw
                    </Button>
                  ) : null}
                </div>
                <div style={{ ...mutedTextStyle, maxWidth: "460px" }}>
                  {post.myNomination?.review?.notes
                    ? post.myNomination.review.notes
                    : post.myNomination?.supporterSummary?.total
                      ? `${post.myNomination.supporterSummary.accepted || 0}/${post.myNomination.supporterSummary.total || 0} supporter confirmations received`
                      : `Click row to ${post.myNomination ? "review or update nomination" : "open nomination form"}`}
                </div>
              </div>
            ),
          },
        ]}
      />
    ) : null}

      {selectedStudentElection.mode === "voting" ? (
        !portalVotingEnabled ? (
          <Alert type="info" title="Voting is available by email">
            Your voting link is sent by email for this election. Student portal voting is not enabled here.
          </Alert>
        ) : hasSubmittedVote ? (
          <div style={{ display: "grid", gap: "var(--spacing-3)" }}>
            <Alert type="success" title="Vote already submitted">
              Your vote has already been submitted for this election.
            </Alert>

            <div style={{ display: "grid", gap: "var(--spacing-3)" }}>
              {votingPosts.map((post) => {
                return (
                  <div
                    key={post.id || post.postId}
                    style={{
                      ...detailPanelStyle,
                      gap: "10px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "var(--font-size-base)",
                          fontWeight: "var(--font-weight-semibold)",
                          color: "var(--color-text-heading)",
                        }}
                      >
                        {post.title}
                      </div>
                      {post.code ? <div style={mutedTextStyle}>{post.code}</div> : null}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <StatusPill
                        tone={post.hasVoted ? "success" : "warning"}
                        pillBaseStyle={pillBaseStyle}
                        statusToneStyles={statusToneStyles}
                      >
                        {post.hasVoted ? "Submitted" : "Not recorded"}
                      </StatusPill>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "var(--spacing-3)" }}>
            {emailVotingEnabled ? (
              <Alert type="info">
                You can submit your vote here in the student portal or through the email link sent for this election.
              </Alert>
            ) : null}

            {votingPosts.map((post) => (
              <div
                key={post.id || post.postId}
                style={{
                  ...detailPanelStyle,
                  gap: "var(--spacing-3)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "var(--font-size-base)",
                      fontWeight: "var(--font-weight-semibold)",
                      color: "var(--color-text-heading)",
                    }}
                  >
                    {post.title}
                  </div>
                  {post.code ? <div style={mutedTextStyle}>{post.code}</div> : null}
                </div>

                <div style={{ display: "grid", gap: "10px" }}>
                  {(post.votingCandidates || []).map((candidate) => {
                    const inputName = `vote-${selectedStudentElection.id}-${post.id || post.postId}`
                    const candidateId = String(candidate.id || candidate.nominationId)
                    const isSelected =
                      String(voteSelections[`${selectedStudentElection.id}:${post.id || post.postId}`] || "") ===
                      candidateId

                    return (
                      <label
                        key={candidateId}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "12px 14px",
                          borderRadius: "var(--radius-card-sm)",
                          border: `1px solid ${isSelected ? "var(--color-primary)" : "var(--color-border-primary)"}`,
                          backgroundColor: isSelected ? "var(--color-primary-bg)" : "var(--color-bg-primary)",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="radio"
                          name={inputName}
                          checked={isSelected}
                          onChange={() =>
                            setVoteSelections((current) => ({
                              ...current,
                              [`${selectedStudentElection.id}:${post.id || post.postId}`]: candidateId,
                            }))
                          }
                        />
                        <div style={{ display: "grid", gap: "2px", minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: "var(--font-weight-medium)",
                              color: "var(--color-text-primary)",
                            }}
                          >
                            {candidate.candidateName || candidate.candidateUserId?.name || candidate.candidateRollNumber}
                          </div>
                          {candidate.candidateRollNumber ? (
                            <div style={mutedTextStyle}>{candidate.candidateRollNumber}</div>
                          ) : null}
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                onClick={() => submitStudentVotes(selectedStudentElection.id, votingPosts)}
                loading={busyKey === `vote:${selectedStudentElection.id}`}
                disabled={votingPosts.length === 0}
              >
                Submit Vote
              </Button>
            </div>
          </div>
        )
      ) : null}

    {selectedStudentElection.mode === "results" ? (
      selectedStudentElection.results?.isPublished ? (
        <div style={{ display: "grid", gap: "var(--spacing-3)" }}>
          {(selectedStudentElection.results?.posts || []).map((postResult) => {
            const rankedCandidates = [...(postResult.candidates || [])].sort(
              (left, right) => Number(right.voteCount || 0) - Number(left.voteCount || 0)
            )
            const winnerIds = new Set((postResult.publishedWinnerNominationIds || []).map((value) => String(value)))
            const winners = rankedCandidates.filter((candidate) =>
              winnerIds.has(String(candidate.nominationId))
            )

            return (
              <div
                key={postResult.postId}
                style={{
                  ...detailPanelStyle,
                  gap: "var(--spacing-3)",
                  padding: "var(--spacing-3)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "var(--spacing-3)",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "var(--font-size-base)",
                        fontWeight: "var(--font-weight-semibold)",
                        color: "var(--color-text-heading)",
                      }}
                    >
                      {postResult.postTitle}
                    </div>
                    <div style={mutedTextStyle}>
                      {postResult.totalVotes} vote(s)
                      {winners.length > 0
                        ? ` · ${postResult.publishedWinnerIsTie ? "Tie" : "Winner"}: ${winners.map((item) => item.candidateName).join(", ")}`
                        : ""}
                    </div>
                  </div>
                  <StatusPill
                    tone="success"
                    pillBaseStyle={pillBaseStyle}
                    statusToneStyles={statusToneStyles}
                  >
                    {winners.length > 0
                      ? postResult.publishedWinnerIsTie
                        ? "Tie Published"
                        : winners[0]?.candidateName
                      : "Published"}
                  </StatusPill>
                </div>

                <div style={{ display: "grid", gap: "8px" }}>
                  {rankedCandidates.map((candidate, index) => {
                    const isWinner = winnerIds.has(String(candidate.nominationId))
                    const percentage = formatVotePercentage(candidate.voteCount, postResult.totalVotes)
                    const numericPercentage = Number.parseFloat(percentage)

                    return (
                      <div
                        key={candidate.nominationId}
                        style={{
                          display: "grid",
                          gap: "8px",
                          padding: "12px",
                          border: "1px solid var(--color-border-primary)",
                          borderRadius: "var(--radius-lg)",
                          backgroundColor: isWinner ? "var(--color-success-bg)" : "var(--color-bg-primary)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "var(--spacing-3)",
                            flexWrap: "wrap",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                            <div
                              style={{
                                minWidth: "28px",
                                height: "28px",
                                borderRadius: "999px",
                                backgroundColor: isWinner
                                  ? "var(--color-success)"
                                  : "var(--color-bg-secondary)",
                                color: isWinner ? "var(--color-white)" : "var(--color-text-body)",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "var(--font-size-xs)",
                                fontWeight: "var(--font-weight-semibold)",
                              }}
                            >
                              #{index + 1}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  fontWeight: "var(--font-weight-medium)",
                                  color: "var(--color-text-heading)",
                                }}
                              >
                                {candidate.candidateName}
                              </div>
                              {!candidate.isNota && candidate.candidateRollNumber ? (
                                <div style={mutedTextStyle}>{candidate.candidateRollNumber}</div>
                              ) : null}
                            </div>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              flexWrap: "wrap",
                              justifyContent: "flex-end",
                            }}
                          >
                            {isWinner ? (
                              <StatusPill
                                tone="success"
                                pillBaseStyle={pillBaseStyle}
                                statusToneStyles={statusToneStyles}
                              >
                                Winner
                              </StatusPill>
                            ) : null}
                            <span
                              style={{
                                fontWeight: "var(--font-weight-semibold)",
                                color: "var(--color-text-heading)",
                              }}
                            >
                              {candidate.voteCount} vote(s)
                            </span>
                            <span style={mutedTextStyle}>{percentage}</span>
                          </div>
                        </div>

                        <div
                          style={{
                            height: "8px",
                            borderRadius: "999px",
                            backgroundColor: "var(--color-bg-secondary)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.max(0, Math.min(numericPercentage, 100))}%`,
                              height: "100%",
                              borderRadius: "999px",
                              backgroundColor: isWinner
                                ? "var(--color-success)"
                                : "var(--color-primary)",
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <Alert type="info">Results will be published soon.</Alert>
      )
    ) : null}
    </>
  )
}

export default StudentElectionWorkspace
