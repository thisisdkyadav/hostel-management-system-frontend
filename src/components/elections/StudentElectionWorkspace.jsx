import { Button, Table } from "czero/react"
import { Alert } from "@/components/ui/feedback"
import { StatusPill } from "@/components/elections/ElectionShared"

const tableHeaderStyle = {
  backgroundColor: "var(--color-bg-secondary)",
}

const tableHeadStyle = {
  backgroundColor: "var(--color-bg-secondary)",
  color: "var(--color-text-muted)",
  fontSize: "var(--font-size-xs)",
  fontWeight: "var(--font-weight-semibold)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
}

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
  castVote,
  infoBannerStyle,
  detailPanelStyle,
  mutedTextStyle,
  formatStageLabel,
  formatDateTime,
  pillBaseStyle,
  statusToneStyles,
}) => (
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

    {selectedStudentElection.mode === "participation" ? (
      <Table>
        <Table.Header style={tableHeaderStyle}>
          <Table.Row>
            <Table.Head style={tableHeadStyle}>Post</Table.Head>
            <Table.Head style={tableHeadStyle}>Status</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {(selectedStudentElection.posts || []).length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={2}>
                <div
                  style={{
                    padding: "var(--spacing-5)",
                    textAlign: "center",
                    color: "var(--color-text-muted)",
                  }}
                >
                  No posts are available for nomination right now.
                </div>
              </Table.Cell>
            </Table.Row>
          ) : (
            (selectedStudentElection.posts || []).map((post) => (
              <Table.Row
                key={post.id}
                onClick={() => openNominationModal(selectedStudentElection, post)}
                style={{ cursor: "pointer" }}
              >
                <Table.Cell>
                  <div style={{ display: "grid", gap: "4px" }}>
                    <span style={{ fontWeight: "var(--font-weight-semibold)" }}>{post.title}</span>
                    <span style={mutedTextStyle}>
                      {formatStageLabel(post.category)}
                      {post.code ? ` · ${post.code}` : ""}
                    </span>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ display: "grid", gap: "4px" }}>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
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
                      </div>
                      {post.myNomination?.review?.notes ? (
                        <div style={{ ...mutedTextStyle, maxWidth: "420px" }}>
                          {post.myNomination.review.notes}
                        </div>
                      ) : (
                        <div style={mutedTextStyle}>
                          Click row to {post.myNomination ? "review or update nomination" : "open nomination form"}
                        </div>
                      )}
                    </div>
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
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table>
    ) : null}

    {selectedStudentElection.mode === "voting" ? (
      <div style={{ display: "grid", gap: "var(--spacing-4)" }}>
        {(selectedStudentElection.posts || []).map((post) => (
          <div key={post.id} style={detailPanelStyle}>
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
                    fontWeight: "var(--font-weight-semibold)",
                    color: "var(--color-text-heading)",
                  }}
                >
                  {post.title}
                </div>
                <div style={mutedTextStyle}>{(post.approvedCandidates || []).length} candidate(s)</div>
              </div>
              {post.hasVoted ? (
                <StatusPill
                  tone="success"
                  pillBaseStyle={pillBaseStyle}
                  statusToneStyles={statusToneStyles}
                >
                  Vote submitted
                </StatusPill>
              ) : null}
            </div>

            {(post.approvedCandidates || []).length === 0 ? (
              <div style={mutedTextStyle}>No verified candidates are available for this post yet.</div>
            ) : (
              <div style={{ display: "grid", gap: "10px" }}>
                {(post.approvedCandidates || []).map((candidate) => {
                  const selectedValue = voteSelections[`${selectedStudentElection.id}:${post.id}`] || ""
                  const checked = String(selectedValue) === String(candidate.id)
                  return (
                    <label
                      key={candidate.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "var(--spacing-3)",
                        padding: "var(--spacing-3)",
                        border: "1px solid var(--color-border-primary)",
                        borderRadius: "var(--radius-lg)",
                        backgroundColor: checked ? "var(--color-primary-bg)" : "var(--color-bg-primary)",
                        cursor: post.hasVoted ? "default" : "pointer",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)" }}>
                        <input
                          type="radio"
                          name={`vote-${selectedStudentElection.id}-${post.id}`}
                          checked={checked}
                          disabled={post.hasVoted}
                          onChange={() =>
                            setVoteSelections((current) => ({
                              ...current,
                              [`${selectedStudentElection.id}:${post.id}`]: candidate.id,
                            }))
                          }
                        />
                        <div style={{ display: "grid", gap: "4px" }}>
                          <span
                            style={{
                              fontWeight: "var(--font-weight-semibold)",
                              color: "var(--color-text-heading)",
                            }}
                          >
                            {candidate.candidateName}
                          </span>
                          <span style={mutedTextStyle}>{candidate.candidateRollNumber}</span>
                        </div>
                      </div>
                      <span style={mutedTextStyle}>{candidate.pitch || "Candidate"}</span>
                    </label>
                  )
                })}

                {!post.hasVoted ? (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      size="sm"
                      onClick={() => castVote(selectedStudentElection.id, post.id)}
                      loading={busyKey === `vote:${selectedStudentElection.id}:${post.id}`}
                      disabled={!voteSelections[`${selectedStudentElection.id}:${post.id}`]}
                    >
                      Submit Vote
                    </Button>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        ))}
      </div>
    ) : null}

    {selectedStudentElection.mode === "results" ? (
      selectedStudentElection.results?.isPublished ? (
        <div style={{ display: "grid", gap: "var(--spacing-3)" }}>
          {(selectedStudentElection.results?.posts || []).map((postResult) => {
            const rankedCandidates = [...(postResult.candidates || [])].sort(
              (left, right) => Number(right.voteCount || 0) - Number(left.voteCount || 0)
            )
            const winner =
              rankedCandidates.find(
                (candidate) =>
                  String(candidate.nominationId) ===
                  String(postResult.publishedWinnerNominationId || "")
              ) || null

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
                      {winner ? ` · Winner: ${winner.candidateName}` : ""}
                    </div>
                  </div>
                  <StatusPill
                    tone="success"
                    pillBaseStyle={pillBaseStyle}
                    statusToneStyles={statusToneStyles}
                  >
                    {winner?.candidateName || "Published"}
                  </StatusPill>
                </div>

                <div style={{ display: "grid", gap: "8px" }}>
                  {rankedCandidates.map((candidate, index) => {
                    const isWinner =
                      String(candidate.nominationId) ===
                      String(postResult.publishedWinnerNominationId || "")
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
                              <div style={mutedTextStyle}>{candidate.candidateRollNumber}</div>
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

export default StudentElectionWorkspace
