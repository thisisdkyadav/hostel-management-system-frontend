import { Button, DataTable, Tabs } from "czero/react"
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
  liveVotingStats,
  loadingVotingStats,
  onSendVotingEmails,
  socketConnected,
  onOpenCloneElection,
  canCloneElection,
  cloneDisabledReason,
}) => {
  const isVotingStage = selectedAdminElection?.currentStage === "voting"
  const tabs = [
    { label: "Posts", value: "posts" },
    { label: "Nominations", value: "nominations" },
    { label: "Results", value: "results" },
    ...(isVotingStage ? [{ label: "Ongoing Voting", value: "voting" }] : []),
    { label: "Info", value: "info" },
  ]
  const votingDispatch = liveVotingStats?.dispatch || {}
  const votingOverview = liveVotingStats?.overview || {}

  return (
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
          tabs={tabs}
          activeTab={adminViewTab}
          setActiveTab={setAdminViewTab}
        />
      </div>

      {adminViewTab === "posts" ? (
        <DataTable
          data={selectedAdminElection.posts || []}
          emptyMessage="No posts configured yet."
          columns={[
          {
            header: "Post",
            key: "title",
            render: (post) => (
              <div style={{ display: "grid", gap: "2px" }}>
                <span style={{ fontWeight: "var(--font-weight-semibold)" }}>{post.title}</span>
                <span style={mutedTextStyle}>
                  {formatStageLabel(post.category)}
                  {post.code ? ` · ${post.code}` : ""}
                </span>
              </div>
            ),
          },
          {
            header: "Candidate Pool",
            key: "candidateEligibility",
            render: (post) => (
              <div style={{ display: "grid", gap: "2px" }}>
                <span style={{ fontWeight: "var(--font-weight-medium)" }}>
                  {post.candidateEligibleCount || 0} student(s)
                </span>
                <span style={mutedTextStyle}>{summarizeScope(post.candidateEligibility)}</span>
              </div>
            ),
          },
          {
            header: "Voter Pool",
            key: "voterEligibility",
            render: (post) => (
              <div style={{ display: "grid", gap: "2px" }}>
                <span style={{ fontWeight: "var(--font-weight-medium)" }}>
                  {post.voterEligibleCount || 0} student(s)
                </span>
                <span style={mutedTextStyle}>{summarizeScope(post.voterEligibility)}</span>
              </div>
            ),
          },
          {
            header: "Requirements",
            key: "requirements",
            render: (post) => (
              <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
                CGPA {post.requirements.minCgpa} · P {post.requirements.proposersRequired} · S{" "}
                {post.requirements.secondersRequired}
              </span>
            ),
          },
          {
            header: "Nominations",
            key: "nominationCounts",
            render: (post) => (
              <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
                {(post.nominationCounts?.submitted || 0) +
                  (post.nominationCounts?.modification_requested || 0) +
                  (post.nominationCounts?.verified || 0)}{" "}
                total · {post.nominationCounts?.verified || 0} verified
              </span>
            ),
          },
          {
            header: "Votes",
            key: "voteCount",
            render: (post) => (
              <span style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }}>
                {post.voteCount || 0}
              </span>
            ),
          },
          ]}
        />
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
          <DataTable
            data={filteredNominations}
            emptyMessage="No nominations in this view."
            onRowClick={setReviewNomination}
            columns={[
            {
              header: "Candidate",
              key: "candidateName",
              render: (nomination) => (
                <div style={{ display: "grid", gap: "2px" }}>
                  <span style={{ fontWeight: "var(--font-weight-semibold)" }}>
                    {nomination.candidateName || nomination.candidateRollNumber}
                  </span>
                  <span style={mutedTextStyle}>{nomination.candidateRollNumber}</span>
                </div>
              ),
            },
            {
              header: "Post",
              key: "postTitle",
            },
            {
              header: "Status",
              key: "status",
              render: (nomination) => (
                <StatusPill
                  tone={getStatusTone(nomination.status)}
                  pillBaseStyle={pillBaseStyle}
                  statusToneStyles={statusToneStyles}
                >
                  {formatStageLabel(nomination.status)}
                </StatusPill>
              ),
            },
            {
              header: "Supporters",
              key: "supporterSummary",
              render: (nomination) => (
                <span style={mutedTextStyle}>
                  {nomination.supporterSummary?.accepted || 0} accepted · {nomination.supporterSummary?.pending || 0} pending
                  {nomination.supporterSummary?.rejected ? ` · ${nomination.supporterSummary.rejected} rejected` : ""}
                </span>
              ),
            },
            {
              header: "Submitted",
              key: "submittedAt",
              render: (nomination) => formatDateTime(nomination.submittedAt),
            },
            ]}
          />
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

          <DataTable
            data={selectedAdminElection?.results?.posts || []}
            emptyMessage="No result data available yet."
            onRowClick={(postResult) => setResultsEditorPostId(String(postResult.postId))}
            columns={[
              {
                header: "Post",
                key: "postTitle",
                render: (postResult) => (
                  <div style={{ display: "grid", gap: "2px" }}>
                    <span style={{ fontWeight: "var(--font-weight-semibold)" }}>{postResult.postTitle}</span>
                    <span style={mutedTextStyle}>{(postResult.candidates || []).length} option(s)</span>
                  </div>
                ),
              },
              {
                header: "Leading Candidate",
                key: "previewWinnerName",
                render: (postResult) => postResult.previewWinnerName || "—",
              },
              {
                header: "Total Votes",
                key: "totalVotes",
              },
              {
                header: "Published Winner",
                key: "publishedWinner",
                render: (postResult) => {
                  const draft = resultsDrafts[String(postResult.postId)] || {}
                  const selectedWinner =
                    (postResult.candidates || []).find(
                      (candidate) => String(candidate.nominationId) === String(draft.winnerNominationId || "")
                    ) || null

                  return selectedWinner?.candidateName || "Not selected"
                },
              },
            ]}
          />
        </>
      ) : null}

      {adminViewTab === "voting" && isVotingStage ? (
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
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <StatusPill
                tone={socketConnected ? "success" : "warning"}
                pillBaseStyle={pillBaseStyle}
                statusToneStyles={statusToneStyles}
              >
                {socketConnected ? "Live" : "Reconnecting"}
              </StatusPill>
              <StatusPill
                tone={getStatusTone(votingDispatch.status || "idle")}
                pillBaseStyle={pillBaseStyle}
                statusToneStyles={statusToneStyles}
              >
                Emails {formatStageLabel(votingDispatch.status || "idle")}
              </StatusPill>
            </div>
            <Button
              size="sm"
              onClick={onSendVotingEmails}
              loading={busyKey === `voting-email:${selectedAdminElectionId}`}
              disabled={
                busyKey === `voting-email:${selectedAdminElectionId}` ||
                votingDispatch.status === "running"
              }
            >
              Send Voting List
            </Button>
          </div>

          <div style={infoGridStyle}>
            <div style={compactStatStyle}>
              <span style={compactStatLabelStyle}>Ballots Submitted</span>
              <span style={compactStatValueStyle}>{votingOverview.ballotsSubmitted || 0}</span>
            </div>
            <div style={compactStatStyle}>
              <span style={compactStatLabelStyle}>Pending Ballots</span>
              <span style={compactStatValueStyle}>{votingOverview.ballotsPending || 0}</span>
            </div>
            <div style={compactStatStyle}>
              <span style={compactStatLabelStyle}>Turnout</span>
              <span style={compactStatValueStyle}>{votingOverview.turnoutPercentage || 0}%</span>
            </div>
            <div style={compactStatStyle}>
              <span style={compactStatLabelStyle}>Voting Emails Sent</span>
              <span style={compactStatValueStyle}>
                {votingDispatch.sentRecipients || 0}/{votingDispatch.totalRecipients || 0}
              </span>
            </div>
          </div>

          <DataTable
            data={liveVotingStats?.posts || []}
            emptyMessage={loadingVotingStats ? "Loading live voting data..." : "No live voting data available yet."}
            columns={[
              {
                header: "Post",
                key: "postTitle",
                render: (post) => (
                  <div style={{ display: "grid", gap: "2px" }}>
                    <span style={{ fontWeight: "var(--font-weight-semibold)" }}>{post.postTitle}</span>
                    <span style={mutedTextStyle}>{post.verifiedCandidateCount || 0} verified candidate(s)</span>
                  </div>
                ),
              },
              {
                header: "Electorate",
                key: "eligibleVoterCount",
                render: (post) => post.eligibleVoterCount || 0,
              },
              {
                header: "Voted",
                key: "votedCount",
                render: (post) => post.votedCount || 0,
              },
              {
                header: "Pending",
                key: "pendingCount",
                render: (post) => post.pendingCount || 0,
              },
              {
                header: "Turnout",
                key: "turnoutPercentage",
                render: (post) => `${post.turnoutPercentage || 0}%`,
              },
              {
                header: "Last Vote",
                key: "lastCastAt",
                render: (post) => formatDateTime(post.lastCastAt),
              },
            ]}
          />
        </>
      ) : null}

      {adminViewTab === "info" ? (
        <>
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

          <div
            style={{
              border: "1px solid var(--color-border-primary)",
              borderRadius: "var(--radius-card-sm)",
              backgroundColor: "var(--color-bg-secondary)",
              padding: "var(--spacing-3)",
              display: "grid",
              gap: "var(--spacing-2)",
            }}
          >
            <div style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-heading)" }}>
              Copy Election
            </div>
            <div style={mutedTextStyle}>
              Create a clean copy of this election for mock testing, then adjust voter eligibility in the copied posts.
            </div>
            {cloneDisabledReason ? <div style={mutedTextStyle}>{cloneDisabledReason}</div> : null}
            <div>
              <Button
                size="sm"
                variant="secondary"
                onClick={onOpenCloneElection}
                loading={busyKey === `clone:${selectedAdminElectionId}`}
                disabled={!canCloneElection || busyKey === `clone:${selectedAdminElectionId}`}
              >
                Copy Election
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </>
  )
}

export default AdminElectionWorkspace
