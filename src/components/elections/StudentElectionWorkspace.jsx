import { Button, Table } from "czero/react"
import { Alert } from "@/components/ui/feedback"
import { StatusPill } from "@/components/elections/ElectionShared"

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
        <Table.Header>
          <Table.Row>
            <Table.Head>Post</Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head align="right">Action</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {(selectedStudentElection.posts || []).length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={3}>
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
              <Table.Row key={post.id}>
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
                  {post.myNomination
                    ? `Nomination ${formatStageLabel(post.myNomination.status)}`
                    : "Not submitted"}
                </Table.Cell>
                <Table.Cell align="right">
                  <div
                    style={{
                      display: "inline-flex",
                      gap: "8px",
                      flexWrap: "wrap",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openNominationModal(selectedStudentElection, post)}
                    >
                      {post.myNomination ? "Edit" : "Nominate"}
                    </Button>
                    {selectedStudentElection.currentStage === "withdrawal" &&
                    post.myNomination &&
                    post.myNomination.status !== "withdrawn" ? (
                      <Button
                        size="sm"
                        variant="danger"
                        loading={busyKey === `withdraw:${selectedStudentElection.id}:${post.myNomination.id}`}
                        onClick={() =>
                          withdrawNomination(selectedStudentElection.id, post.myNomination.id)
                        }
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
        <div style={{ display: "grid", gap: "var(--spacing-4)" }}>
          {(selectedStudentElection.results?.posts || []).map((postResult) => {
            const winner =
              (postResult.candidates || []).find(
                (candidate) =>
                  String(candidate.nominationId) ===
                  String(postResult.publishedWinnerNominationId || "")
              ) || null

            return (
              <div key={postResult.postId} style={detailPanelStyle}>
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
                      {postResult.postTitle}
                    </div>
                    <div style={mutedTextStyle}>{postResult.totalVotes} vote(s)</div>
                  </div>
                  <StatusPill
                    tone="success"
                    pillBaseStyle={pillBaseStyle}
                    statusToneStyles={statusToneStyles}
                  >
                    {winner?.candidateName || "Result published"}
                  </StatusPill>
                </div>

                <div style={{ display: "grid", gap: "8px" }}>
                  {(postResult.candidates || []).map((candidate) => (
                    <div
                      key={candidate.nominationId}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "var(--spacing-3)",
                        padding: "var(--spacing-3)",
                        border: "1px solid var(--color-border-primary)",
                        borderRadius: "var(--radius-lg)",
                        backgroundColor:
                          String(candidate.nominationId) ===
                          String(postResult.publishedWinnerNominationId || "")
                            ? "var(--color-success-bg)"
                            : "var(--color-bg-primary)",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: "var(--font-weight-medium)",
                          color: "var(--color-text-heading)",
                        }}
                      >
                        {candidate.candidateName}
                      </span>
                      <strong style={{ color: "var(--color-text-heading)" }}>{candidate.voteCount}</strong>
                    </div>
                  ))}
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
