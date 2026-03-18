import { Button, Table, Tabs } from "czero/react"
import { Clock3 } from "lucide-react"
import { StatusPill } from "@/components/elections/ElectionShared"

const nominationTabsDefault = [
  { label: "All", value: "all" },
  { label: "Submitted", value: "submitted" },
  { label: "Modification Requested", value: "modification_requested" },
  { label: "Verified", value: "verified" },
  { label: "Rejected", value: "rejected" },
  { label: "Withdrawn", value: "withdrawn" },
]

const AdminElectionWorkspace = ({
  selectedAdminElection,
  selectedAdminElectionId,
  adminViewTab,
  setAdminViewTab,
  nominationTab,
  setNominationTab,
  filteredNominations,
  adminOverview,
  resultsDrafts,
  busyKey,
  publishResults,
  setReviewNomination,
  setResultsEditorPostId,
  infoBannerStyle,
  badgeRowStyle,
  mutedTextStyle,
  infoGridStyle,
  compactStatStyle,
  compactStatLabelStyle,
  compactStatValueStyle,
  formatStageLabel,
  formatDateTime,
  getStatusTone,
  summarizeScope,
  pillBaseStyle,
  statusToneStyles,
  nominationTabs = nominationTabsDefault,
}) => (
  <>
    <div style={infoBannerStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)", flexWrap: "wrap" }}>
        <span style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-heading)" }}>
          {selectedAdminElection.title}
        </span>
        <div style={badgeRowStyle}>
          <StatusPill
            tone={getStatusTone(selectedAdminElection.currentStage)}
            icon={<Clock3 size={12} />}
            pillBaseStyle={pillBaseStyle}
            statusToneStyles={statusToneStyles}
          >
            {formatStageLabel(selectedAdminElection.currentStage)}
          </StatusPill>
          <StatusPill
            tone={getStatusTone(selectedAdminElection.status)}
            pillBaseStyle={pillBaseStyle}
            statusToneStyles={statusToneStyles}
          >
            {formatStageLabel(selectedAdminElection.status)}
          </StatusPill>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)", flexWrap: "wrap" }}>
        <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
          {selectedAdminElection.academicYear} · {formatStageLabel(selectedAdminElection.phase)}
        </span>
        <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
          <strong>{adminOverview.postCount}</strong> posts · <strong>{adminOverview.nominationCount}</strong>{" "}
          nominations · <strong>{adminOverview.verifiedCount}</strong> verified ·{" "}
          <strong>{adminOverview.voteCount}</strong> votes
        </span>
      </div>
    </div>

    <div style={{ marginBottom: "var(--spacing-3)" }}>
      <Tabs
        variant="pills"
        tabs={[
          { label: "Posts", value: "posts" },
          { label: "Nominations", value: "nominations" },
          { label: "Results", value: "results" },
          { label: "Schedule", value: "schedule" },
        ]}
        activeTab={adminViewTab}
        setActiveTab={setAdminViewTab}
      />
    </div>

    {adminViewTab === "posts" ? (
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Post</Table.Head>
            <Table.Head>Candidate Pool</Table.Head>
            <Table.Head>Voter Pool</Table.Head>
            <Table.Head>Requirements</Table.Head>
            <Table.Head>Nominations</Table.Head>
            <Table.Head>Votes</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {(selectedAdminElection.posts || []).length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={6}>
                <div
                  style={{
                    padding: "var(--spacing-4)",
                    textAlign: "center",
                    color: "var(--color-text-muted)",
                  }}
                >
                  No posts configured yet.
                </div>
              </Table.Cell>
            </Table.Row>
          ) : (
            (selectedAdminElection.posts || []).map((post) => (
              <Table.Row key={post.id}>
                <Table.Cell>
                  <div style={{ display: "grid", gap: "2px" }}>
                    <span style={{ fontWeight: "var(--font-weight-semibold)" }}>{post.title}</span>
                    <span style={mutedTextStyle}>
                      {formatStageLabel(post.category)}
                      {post.code ? ` · ${post.code}` : ""}
                    </span>
                  </div>
                </Table.Cell>
                <Table.Cell>{summarizeScope(post.candidateEligibility)}</Table.Cell>
                <Table.Cell>{summarizeScope(post.voterEligibility)}</Table.Cell>
                <Table.Cell>
                  CGPA {post.requirements.minCgpa} · P {post.requirements.proposersRequired} · S{" "}
                  {post.requirements.secondersRequired}
                </Table.Cell>
                <Table.Cell>
                  {(post.nominationCounts?.submitted || 0) +
                    (post.nominationCounts?.modification_requested || 0) +
                    (post.nominationCounts?.verified || 0)} total ·{" "}
                  {post.nominationCounts?.verified || 0} verified
                </Table.Cell>
                <Table.Cell>{post.voteCount || 0}</Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table>
    ) : null}

    {adminViewTab === "nominations" ? (
      <>
        <div style={{ marginBottom: "var(--spacing-3)" }}>
          <Tabs
            variant="pills"
            tabs={nominationTabs}
            activeTab={nominationTab}
            setActiveTab={setNominationTab}
          />
        </div>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Candidate</Table.Head>
              <Table.Head>Post</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head>Submitted</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredNominations.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={4}>
                  <div
                    style={{
                      padding: "var(--spacing-4)",
                      textAlign: "center",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    No nominations in this view.
                  </div>
                </Table.Cell>
              </Table.Row>
            ) : (
              filteredNominations.map((nomination) => (
                <Table.Row
                  key={nomination.id}
                  onClick={() => setReviewNomination(nomination)}
                  style={{ cursor: "pointer" }}
                >
                  <Table.Cell>
                    <div style={{ display: "grid", gap: "2px" }}>
                      <span style={{ fontWeight: "var(--font-weight-semibold)" }}>
                        {nomination.candidateName || nomination.candidateRollNumber}
                      </span>
                      <span style={mutedTextStyle}>{nomination.candidateRollNumber}</span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>{nomination.postTitle}</Table.Cell>
                  <Table.Cell>
                    <StatusPill
                      tone={getStatusTone(nomination.status)}
                      pillBaseStyle={pillBaseStyle}
                      statusToneStyles={statusToneStyles}
                    >
                      {formatStageLabel(nomination.status)}
                    </StatusPill>
                  </Table.Cell>
                  <Table.Cell>{formatDateTime(nomination.submittedAt)}</Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </>
    ) : null}

    {adminViewTab === "results" ? (
      <>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "var(--spacing-3)",
            flexWrap: "wrap",
            marginBottom: "var(--spacing-3)",
          }}
        >
          <div style={mutedTextStyle}>
            Open a row to adjust the winner before publishing the final result.
          </div>
          <Button
            size="sm"
            onClick={publishResults}
            loading={busyKey === `results:${selectedAdminElectionId}`}
            disabled={(selectedAdminElection?.results?.posts || []).length === 0}
          >
            Publish Results
          </Button>
        </div>

        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Post</Table.Head>
              <Table.Head>Leading Candidate</Table.Head>
              <Table.Head>Total Votes</Table.Head>
              <Table.Head>Published Winner</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {(selectedAdminElection?.results?.posts || []).length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={4}>
                  <div
                    style={{
                      padding: "var(--spacing-4)",
                      textAlign: "center",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    No result data available yet.
                  </div>
                </Table.Cell>
              </Table.Row>
            ) : (
              (selectedAdminElection?.results?.posts || []).map((postResult) => {
                const draft = resultsDrafts[String(postResult.postId)] || {}
                const selectedWinner =
                  (postResult.candidates || []).find(
                    (candidate) =>
                      String(candidate.nominationId) === String(draft.winnerNominationId || "")
                  ) || null

                return (
                  <Table.Row
                    key={postResult.postId}
                    onClick={() => setResultsEditorPostId(String(postResult.postId))}
                    style={{ cursor: "pointer" }}
                  >
                    <Table.Cell>
                      <div style={{ display: "grid", gap: "2px" }}>
                        <span style={{ fontWeight: "var(--font-weight-semibold)" }}>
                          {postResult.postTitle}
                        </span>
                        <span style={mutedTextStyle}>
                          {(postResult.candidates || []).length} candidate(s)
                        </span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>{postResult.previewWinnerName || "—"}</Table.Cell>
                    <Table.Cell>{postResult.totalVotes}</Table.Cell>
                    <Table.Cell>{selectedWinner?.candidateName || "Not selected"}</Table.Cell>
                  </Table.Row>
                )
              })
            )}
          </Table.Body>
        </Table>
      </>
    ) : null}

    {adminViewTab === "schedule" ? (
      <div style={infoGridStyle}>
        <div style={compactStatStyle}>
          <span style={compactStatLabelStyle}>Announcement</span>
          <span style={compactStatValueStyle}>
            {formatDateTime(selectedAdminElection.timeline?.announcementAt)}
          </span>
        </div>
        <div style={compactStatStyle}>
          <span style={compactStatLabelStyle}>Nomination Ends</span>
          <span style={compactStatValueStyle}>
            {formatDateTime(selectedAdminElection.timeline?.nominationEndAt)}
          </span>
        </div>
        <div style={compactStatStyle}>
          <span style={compactStatLabelStyle}>Withdrawal Ends</span>
          <span style={compactStatValueStyle}>
            {formatDateTime(selectedAdminElection.timeline?.withdrawalEndAt)}
          </span>
        </div>
        <div style={compactStatStyle}>
          <span style={compactStatLabelStyle}>Voting Starts</span>
          <span style={compactStatValueStyle}>
            {formatDateTime(selectedAdminElection.timeline?.votingStartAt)}
          </span>
        </div>
        <div style={compactStatStyle}>
          <span style={compactStatLabelStyle}>Voting Ends</span>
          <span style={compactStatValueStyle}>
            {formatDateTime(selectedAdminElection.timeline?.votingEndAt)}
          </span>
        </div>
        <div style={compactStatStyle}>
          <span style={compactStatLabelStyle}>Results</span>
          <span style={compactStatValueStyle}>
            {formatDateTime(selectedAdminElection.timeline?.resultsAnnouncedAt)}
          </span>
        </div>
        <div style={compactStatStyle}>
          <span style={compactStatLabelStyle}>CEO</span>
          <span style={compactStatValueStyle}>
            {selectedAdminElection.electionCommission?.chiefElectionOfficerRollNumber || "—"}
          </span>
        </div>
        <div style={compactStatStyle}>
          <span style={compactStatLabelStyle}>Officers</span>
          <span style={compactStatValueStyle}>
            {(selectedAdminElection.electionCommission?.officerRollNumbers || []).join(", ") || "—"}
          </span>
        </div>
      </div>
    ) : null}
  </>
)

export default AdminElectionWorkspace
