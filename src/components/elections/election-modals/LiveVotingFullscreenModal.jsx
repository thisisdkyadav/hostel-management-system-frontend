import { HStack, Modal, Table, Text } from "hzero"

export const LiveVotingFullscreenModal = ({
  isOpen,
  onClose,
  electionTitle,
  liveVotingStats,
  loadingVotingStats,
  socketConnected,
  formatDateTime,
}) => {
  const posts = liveVotingStats?.posts || []
  const overview = liveVotingStats?.overview || {}

  const formatCompactPercentage = (value) => {
    const percentage = Number(value || 0)
    if (!Number.isFinite(percentage) || percentage <= 0) return "0%"
    return percentage >= 10 ? `${percentage.toFixed(1)}%` : `${percentage.toFixed(2)}%`
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      width={1480}
      closeButtonVariant="button"
      title={
        <HStack gap={6} align="center" style={{ marginTop: "-4px", marginBottom: "-4px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 10px",
              borderRadius: "var(--radius-button-pill)",
              backgroundColor: socketConnected ? "rgba(34, 197, 94, 0.1)" : "rgba(245, 158, 11, 0.1)",
              color: socketConnected ? "var(--color-success)" : "var(--color-warning)",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-medium)",
              border: `1px solid ${socketConnected ? "rgba(34, 197, 94, 0.2)" : "rgba(245, 158, 11, 0.2)"}`,
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "currentColor",
                animation: socketConnected ? "pulse 2s infinite" : "none",
              }}
            />
            {socketConnected ? "Live Status" : "Reconnecting"}
          </div>

          <HStack align="center" gap={5} size="base">
            <HStack gap="8px" align="center">
              <Text as="span" color="muted">Eligible Voters</Text>
              <Text as="span" weight="semibold" color="heading" size="md">
                {overview.ballotsSubmitted + overview.ballotsPending || 0}
              </Text>
            </HStack>
            <div style={{ width: "1px", height: "18px", backgroundColor: "var(--color-border-primary)" }} />
            <HStack gap="8px" align="center">
              <Text as="span" color="muted">Votes Submitted</Text>
              <Text as="span" weight="semibold" color="success" size="md">
                {overview.ballotsSubmitted || 0}
              </Text>
            </HStack>
            <div style={{ width: "1px", height: "18px", backgroundColor: "var(--color-border-primary)" }} />
            <HStack gap="8px" align="center">
              <Text as="span" color="muted">Pending</Text>
              <Text as="span" weight="semibold" color="warning" size="md">
                {overview.ballotsPending || 0}
              </Text>
            </HStack>
            <div style={{ width: "1px", height: "18px", backgroundColor: "var(--color-border-primary)" }} />
            <HStack gap="8px" align="center">
              <Text as="span" color="muted">Turnout</Text>
              <Text as="span" weight="bold" color="brand" size="lg">
                {overview.turnoutPercentage || 0}%
              </Text>
            </HStack>
          </HStack>
        </HStack>
      }
    >
      <div
        style={{
          maxHeight: "calc(95vh - 100px)",
          overflow: "auto",
          backgroundColor: "var(--color-bg-page)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-border-primary)",
        }}
      >
        <Table>
          <Table.Header>
            <Table.Row style={{ backgroundColor: "var(--color-bg-secondary)", borderBottom: "1px solid var(--color-border-primary)" }}>
              <Table.Head style={{ width: "240px", padding: "4px 10px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Post</Table.Head>
              <Table.Head style={{ padding: "4px 10px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Candidates</Table.Head>
              <Table.Head align="center" style={{ width: "80px", padding: "4px 10px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Elect</Table.Head>
              <Table.Head align="center" style={{ width: "80px", padding: "4px 10px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Voted</Table.Head>
              <Table.Head align="center" style={{ width: "80px", padding: "4px 10px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Pending</Table.Head>
              <Table.Head align="center" style={{ width: "80px", padding: "4px 10px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Turnout</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {posts.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={6} style={{ textAlign: "center", padding: "var(--spacing-5)", color: "var(--color-text-muted)" }}>
                  {loadingVotingStats ? "Loading live data..." : "No live voting data available."}
                </Table.Cell>
              </Table.Row>
            ) : (
              posts.map((post, index) => {
                const sortedCandidates = [...(post.candidates || [])].sort((left, right) => {
                  if (left.isNota && !right.isNota) return -1
                  if (!left.isNota && right.isNota) return 1
                  return (right.voteCount || 0) - (left.voteCount || 0) || String(left.candidateName || "").localeCompare(String(right.candidateName || ""))
                })

                return (
                  <Table.Row key={post.postId} style={{ backgroundColor: index % 2 === 0 ? "var(--color-bg-primary)" : "var(--color-bg-tertiary)" }}>
                    <Table.Cell style={{ padding: "6px 10px", verticalAlign: "middle" }}>
                      <Text as="div" weight="semibold" color="heading" size="13px" leading={1.2}>
                        {post.postTitle}
                      </Text>
                    </Table.Cell>
                    <Table.Cell style={{ padding: "4px 10px" }}>
                      <HStack gap="4px" wrap>
                        {sortedCandidates.map((candidate) => (
                          <div
                            key={candidate.nominationId}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              border: `1px solid ${candidate.isNota ? "var(--color-border-primary)" : "var(--color-primary-bg)"}`,
                              backgroundColor: candidate.isNota ? "var(--color-bg-secondary)" : "rgba(19, 96, 171, 0.04)",
                              borderRadius: "var(--radius-md)",
                              padding: "2px 6px",
                              gap: "6px",
                            }}
                          >
                            <Text as="span" size="12px" weight="medium" color="primary" style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {candidate.isNota ? "NOTA" : candidate.candidateName || candidate.candidateRollNumber}
                            </Text>
                            <HStack gap="2px" align="center">
                              <Text as="span" size="12px" weight="bold" color="heading">
                                {candidate.voteCount || 0}
                              </Text>
                              <Text as="span" size="10px" color="muted">
                                ({formatCompactPercentage(candidate.votePercentage)})
                              </Text>
                            </HStack>
                          </div>
                        ))}
                      </HStack>
                    </Table.Cell>
                    <Table.Cell align="center" style={{ padding: "6px 10px", verticalAlign: "middle", color: "var(--color-text-muted)", fontSize: "13px" }}>
                      {post.eligibleVoterCount || 0}
                    </Table.Cell>
                    <Table.Cell align="center" style={{ padding: "6px 10px", verticalAlign: "middle", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)", fontSize: "13px" }}>
                      {post.votedCount || 0}
                    </Table.Cell>
                    <Table.Cell align="center" style={{ padding: "6px 10px", verticalAlign: "middle", color: "var(--color-warning)", fontWeight: "var(--font-weight-medium)", fontSize: "13px" }}>
                      {post.pendingCount || 0}
                    </Table.Cell>
                    <Table.Cell align="center" style={{ padding: "6px 10px", verticalAlign: "middle", fontWeight: "var(--font-weight-bold)", color: "var(--color-primary)", fontSize: "13px" }}>
                      {post.turnoutPercentage || 0}%
                    </Table.Cell>
                  </Table.Row>
                )
              })
            )}
          </Table.Body>
        </Table>
      </div>
    </Modal>
  )
}
