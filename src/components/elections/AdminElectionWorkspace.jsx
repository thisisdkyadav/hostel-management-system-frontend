import { useMemo, useState } from "react"
import { Button, DataTable, Grid, HStack, IconCircle, Tabs, Text } from "hzero"
import { Clock3, Maximize2 } from "lucide-react"
import { StatusPill } from "@/components/elections/ElectionShared"
import { LiveVotingFullscreenModal } from "@/components/elections/ElectionModals"
import { getMediaUrl } from "@/utils/mediaUtils"

const nominationTabsDefault = [
  { label: "All", value: "all" },
  { label: "Submitted", value: "submitted" },
  { label: "Modification Requested", value: "modification_requested" },
  { label: "Verified", value: "verified" },
  { label: "Rejected", value: "rejected" },
  { label: "Withdrawn", value: "withdrawn" },
]

const formatVotePercentage = (voteCount, totalVotes) => {
  const votes = Number(voteCount || 0)
  const total = Number(totalVotes || 0)
  if (total <= 0) return "0%"

  const percentage = (votes / total) * 100
  return percentage >= 10 ? `${percentage.toFixed(1)}%` : `${percentage.toFixed(2)}%`
}

const getSelectedWinnerIds = (draft = {}) =>
  Array.isArray(draft?.winnerNominationIds) && draft.winnerNominationIds.length > 0
    ? draft.winnerNominationIds.map((value) => String(value))
    : draft?.winnerNominationId
      ? [String(draft.winnerNominationId)]
      : []

const nominationViewTabs = [
  { label: "Flat", value: "flat" },
  { label: "Grouped by Post", value: "grouped" },
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
  onPublishResults,
  onExportResults,
  onExportNominations,
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
  onOpenVotingEmailRecipients,
  onSendTestEmails,
  onOpenTestEmailRecipients,
  socketConnected,
  onOpenCloneElection,
  canCloneElection,
  cloneDisabledReason,
  readOnly = false,
}) => {
  const isVotingOperationsOpen = Boolean(selectedAdminElection?.votingControlWindowOpen)
  const emailVotingEnabled = ["email", "both"].includes(
    String(selectedAdminElection?.votingAccess?.mode || "both")
  )
  const canViewResultsTab = ["results", "handover", "completed"].includes(selectedAdminElection?.currentStage)
  const tabs = readOnly
    ? [{ label: "Nominations", value: "nominations" }]
    : [
        { label: "Posts", value: "posts" },
        { label: "Nominations", value: "nominations" },
        ...(canViewResultsTab ? [{ label: "Results", value: "results" }] : []),
        ...(isVotingOperationsOpen ? [{ label: "Ongoing Voting", value: "voting" }] : []),
        { label: "Info", value: "info" },
      ]
  const votingDispatch = liveVotingStats?.dispatch || {}
  const votingOverview = liveVotingStats?.overview || {}
  const resultPosts = selectedAdminElection?.results?.posts || []
  const [nominationViewMode, setNominationViewMode] = useState("flat")
  const resultSummary = {
    totalVotes: resultPosts.reduce((sum, post) => sum + Number(post.totalVotes || 0), 0),
    publishedCount: resultPosts.filter((post) => {
      const draft = resultsDrafts[String(post.postId)] || {}
      return getSelectedWinnerIds(draft).length > 0
    }).length,
    notaCount: resultPosts.filter((post) => {
      const draft = resultsDrafts[String(post.postId)] || {}
      return getSelectedWinnerIds(draft).includes("nota")
    }).length,
  }
  const [showVotingFullscreen, setShowVotingFullscreen] = useState(false)
  const nominationColumns = useMemo(
    () => [
      {
        header: "Candidate",
        key: "candidateName",
        render: (nomination) => {
          const candidateLabel = nomination.candidateName || nomination.candidateRollNumber
          const initials = String(candidateLabel || "?")
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0] || "")
            .join("")
            .toUpperCase()

          return (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
              <IconCircle size="var(--avatar-sm)" bg="brand" color="brand" style={{ overflow: "hidden", border: "1px solid var(--color-border-primary)", fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-xs)" }}>
                {nomination.candidateProfileImage ? (
                  <img
                    src={getMediaUrl(nomination.candidateProfileImage)}
                    alt={candidateLabel}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  initials || "?"
                )}
              </IconCircle>
              <Grid cols={1} gap="2px" style={{ minWidth: 0 }}>
                <Text as="span" weight="semibold" color="heading" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {candidateLabel}
                </Text>
                <span style={mutedTextStyle}>{nomination.candidateRollNumber}</span>
              </Grid>
            </div>
          )
        },
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
    ],
    [formatDateTime, formatStageLabel, getStatusTone, mutedTextStyle, pillBaseStyle, statusToneStyles]
  )
  const groupedNominations = useMemo(() => {
    const groups = new Map()

    filteredNominations.forEach((nomination) => {
      const groupKey = nomination.postTitle || "Untitled Post"
      if (!groups.has(groupKey)) {
        groups.set(groupKey, [])
      }
      groups.get(groupKey).push(nomination)
    })

    return Array.from(groups.entries()).map(([postTitle, nominations]) => ({
      postTitle,
      nominations,
    }))
  }, [filteredNominations])

  return (
    <>
      <div style={infoBannerStyle}>
      <HStack gap={3} align="center" wrap>
        <Text as="span" weight="semibold" color="heading">
          {selectedAdminElection.title}
        </Text>
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
          {selectedAdminElection?.mockSettings?.enabled ? (
            <StatusPill
              tone="warning"
              pillBaseStyle={pillBaseStyle}
              statusToneStyles={statusToneStyles}
            >
              Mock
            </StatusPill>
          ) : null}
        </div>
      </HStack>
      <HStack gap={3} align="center" wrap>
        <Text as="span" size="sm" color="muted">
          {selectedAdminElection.academicYear} · {formatStageLabel(selectedAdminElection.phase)}
        </Text>
        <Text as="span" size="sm" color="body">
          <strong>{adminOverview.postCount}</strong> posts · <strong>{adminOverview.nominationCount}</strong>{" "}
          nominations · <strong>{adminOverview.verifiedCount}</strong> verified ·{" "}
          <strong>{adminOverview.voteCount}</strong> votes
        </Text>
      </HStack>
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
              <Grid cols={1} gap="2px">
                <Text as="span" weight="semibold">{post.title}</Text>
                <span style={mutedTextStyle}>
                  {formatStageLabel(post.category)}
                  {post.code ? ` · ${post.code}` : ""}
                </span>
              </Grid>
            ),
          },
          {
            header: "Candidate Pool",
            key: "candidateEligibility",
            render: (post) => (
              <Grid cols={1} gap="2px">
                <Text as="span" weight="medium">
                  {post.candidateEligibleCount || 0} student(s)
                </Text>
                <span style={mutedTextStyle}>{summarizeScope(post.candidateEligibility)}</span>
              </Grid>
            ),
          },
          {
            header: "Voter Pool",
            key: "voterEligibility",
            render: (post) => (
              <Grid cols={1} gap="2px">
                <Text as="span" weight="medium">
                  {post.voterEligibleCount || 0} student(s)
                </Text>
                <span style={mutedTextStyle}>{summarizeScope(post.voterEligibility)}</span>
              </Grid>
            ),
          },
          {
            header: "Requirements",
            key: "requirements",
            render: (post) => (
              <Text as="span" size="sm" color="body">
                CGPA {post.requirements.minCgpa} · P {post.requirements.proposersRequired} · S{" "}
                {post.requirements.secondersRequired}
              </Text>
            ),
          },
          {
            header: "Nominations",
            key: "nominationCounts",
            render: (post) => (
              <Text as="span" size="sm" color="body">
                {(post.nominationCounts?.submitted || 0) +
                  (post.nominationCounts?.modification_requested || 0) +
                  (post.nominationCounts?.verified || 0)}{" "}
                total · {post.nominationCounts?.verified || 0} verified
              </Text>
            ),
          },
          {
            header: "Votes",
            key: "voteCount",
            render: (post) => (
              <Text as="span" weight="medium" color="primary">
                {post.voteCount || 0}
              </Text>
            ),
          },
          ]}
        />
      ) : null}

      {adminViewTab === "nominations" ? (
        <>
          <HStack gap={3} align="center" justify="between" wrap style={{ marginBottom: "var(--spacing-3)" }}>
            <Tabs
              variant="pills"
              tabs={nominationTabs}
              activeTab={nominationTab}
              setActiveTab={setNominationTab}
            />
            <HStack gap="8px" align="center" wrap>
              <Tabs
                variant="pills"
                tabs={nominationViewTabs}
                activeTab={nominationViewMode}
                setActiveTab={setNominationViewMode}
              />
              {!readOnly ? (
                <Button size="sm" variant="secondary" onClick={onExportNominations}>
                  Export CSV
                </Button>
              ) : null}
            </HStack>
          </HStack>
          {nominationViewMode === "grouped" ? (
            groupedNominations.length ? (
              <Grid cols={1} gap={3}>
                {groupedNominations.map((group) => (
                  <Grid cols={1} gap={2} style={{ border: "1px solid var(--color-border-primary)", borderRadius: "var(--radius-xl)", backgroundColor: "var(--color-bg-primary)", padding: "var(--spacing-3)" }} key={group.postTitle}>
                    <HStack gap={3} align="center" justify="between" wrap>
                      <Text as="span" weight="semibold" color="heading">
                        {group.postTitle}
                      </Text>
                      <span style={mutedTextStyle}>{group.nominations.length} nomination(s)</span>
                    </HStack>
                    <DataTable
                      data={group.nominations}
                      emptyMessage="No nominations in this post."
                      onRowClick={setReviewNomination}
                      columns={nominationColumns.filter((column) => column.key !== "postTitle")}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <DataTable data={[]} emptyMessage="No nominations in this view." columns={nominationColumns} />
            )
          ) : (
            <DataTable
              data={filteredNominations}
              emptyMessage="No nominations in this view."
              onRowClick={setReviewNomination}
              columns={nominationColumns}
            />
          )}
        </>
      ) : null}

      {adminViewTab === "results" ? (
        <>
          <HStack gap={3} align="center" justify="between" wrap style={{ marginBottom: "var(--spacing-3)" }}>
            <div style={mutedTextStyle}>
              Review each post, adjust the selected winner if needed, then export or publish the final result.
            </div>
            <HStack gap="8px" wrap>
              <Button
                size="sm"
                variant="secondary"
                onClick={onExportResults}
                disabled={resultPosts.length === 0}
              >
                Export CSV
              </Button>
              <Button
                size="sm"
                onClick={onPublishResults}
                loading={busyKey === `results:${selectedAdminElectionId}`}
                disabled={resultPosts.length === 0}
              >
                Publish Results
              </Button>
            </HStack>
          </HStack>

          <div style={infoGridStyle}>
            <div style={compactStatStyle}>
              <span style={compactStatLabelStyle}>Posts</span>
              <span style={compactStatValueStyle}>{resultPosts.length}</span>
            </div>
            <div style={compactStatStyle}>
              <span style={compactStatLabelStyle}>Votes Counted</span>
              <span style={compactStatValueStyle}>{resultSummary.totalVotes}</span>
            </div>
            <div style={compactStatStyle}>
              <span style={compactStatLabelStyle}>Selected Winners</span>
              <span style={compactStatValueStyle}>{resultSummary.publishedCount}</span>
            </div>
            <div style={compactStatStyle}>
              <span style={compactStatLabelStyle}>NOTA Selected</span>
              <span style={compactStatValueStyle}>{resultSummary.notaCount}</span>
            </div>
          </div>

          <DataTable
            data={resultPosts}
            emptyMessage="No result data available yet."
            onRowClick={(postResult) => setResultsEditorPostId(String(postResult.postId))}
            columns={[
              {
                header: "Post",
                key: "postTitle",
                render: (postResult) => (
                  <Grid cols={1} gap="2px">
                    <Text as="span" weight="semibold">{postResult.postTitle}</Text>
                    <span style={mutedTextStyle}>{postResult.totalVotes || 0} vote(s)</span>
                  </Grid>
                ),
              },
              {
                header: "Leading Candidate",
                key: "previewWinnerName",
                render: (postResult) =>
                  postResult.previewWinnerIsTie
                    ? `Tie · ${(postResult.previewWinnerNames || []).join(", ")}`
                    : postResult.previewWinnerName || "—",
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
                  const selectedWinnerIds = getSelectedWinnerIds(draft)
                  const selectedWinners = (postResult.candidates || []).filter((candidate) =>
                    selectedWinnerIds.includes(String(candidate.nominationId))
                  )

                  if (selectedWinners.length === 0) return "Not selected"
                  if (draft?.winnerIsTie) return `Tie · ${selectedWinners.map((item) => item.candidateName).join(", ")}`
                  return selectedWinners[0]?.candidateName || "Not selected"
                },
              },
              {
                header: "Student Counts",
                key: "showVoteCountToStudents",
                render: (postResult) => {
                  const draft = resultsDrafts[String(postResult.postId)] || {}
                  return draft?.showVoteCountToStudents !== false ? "Visible" : "Hidden"
                },
              },
              {
                header: "Leading Margin",
                key: "leadingMargin",
                render: (postResult) => {
                  const topTwo = [...(postResult.candidates || [])]
                    .sort((left, right) => Number(right.voteCount || 0) - Number(left.voteCount || 0))
                    .slice(0, 2)
                  const margin = Number(topTwo[0]?.voteCount || 0) - Number(topTwo[1]?.voteCount || 0)
                  return topTwo.length > 1 ? `${margin} vote(s)` : "—"
                },
              },
            ]}
          />
        </>
      ) : null}

      {adminViewTab === "voting" && isVotingOperationsOpen ? (
        <>
          <HStack gap={3} align="center" justify="between" wrap style={{ marginBottom: "var(--spacing-3)" }}>
            <HStack gap="8px" align="center" wrap>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowVotingFullscreen(true)}
                disabled={loadingVotingStats && !(liveVotingStats?.posts || []).length}
              >
                <Maximize2 size={14} /> Full Screen
              </Button>
              <StatusPill
                tone={socketConnected ? "success" : "warning"}
                pillBaseStyle={pillBaseStyle}
                statusToneStyles={statusToneStyles}
              >
                {socketConnected ? "Live" : "Reconnecting"}
              </StatusPill>
              {emailVotingEnabled ? (
                <StatusPill
                  tone={getStatusTone(votingDispatch.status || "idle")}
                  pillBaseStyle={pillBaseStyle}
                  statusToneStyles={statusToneStyles}
                >
                  Emails {formatStageLabel(votingDispatch.status || "idle")}
                </StatusPill>
              ) : null}
            </HStack>
            {emailVotingEnabled ? (
              <HStack gap="8px" align="center" wrap>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={onOpenVotingEmailRecipients}
                  disabled={loadingVotingStats && !(liveVotingStats?.posts || []).length}
                >
                  View Link Status
                </Button>
                <Button
                  size="sm"
                  onClick={onSendVotingEmails}
                  loading={busyKey === `voting-email:${selectedAdminElectionId}`}
                  disabled={
                    busyKey === `voting-email:${selectedAdminElectionId}` ||
                    ["queued", "running"].includes(votingDispatch.status)
                  }
                >
                  Send Voting List
                </Button>
              </HStack>
            ) : null}
          </HStack>

          <div style={infoGridStyle}>
            <div style={compactStatStyle}>
              <span style={compactStatLabelStyle}>Votes Submitted</span>
              <span style={compactStatValueStyle}>{votingOverview.ballotsSubmitted || 0}</span>
            </div>
            <div style={compactStatStyle}>
              <span style={compactStatLabelStyle}>Pending Voters</span>
              <span style={compactStatValueStyle}>{votingOverview.ballotsPending || 0}</span>
            </div>
            <div style={compactStatStyle}>
              <span style={compactStatLabelStyle}>Turnout</span>
              <span style={compactStatValueStyle}>{votingOverview.turnoutPercentage || 0}%</span>
            </div>
            {emailVotingEnabled ? (
              <div style={compactStatStyle}>
                <span style={compactStatLabelStyle}>Voting Emails Sent</span>
                <span style={compactStatValueStyle}>
                  {votingDispatch.sentRecipients || 0}/{votingDispatch.totalRecipients || 0}
                </span>
              </div>
            ) : null}
          </div>

          <DataTable
            data={liveVotingStats?.posts || []}
            emptyMessage={loadingVotingStats ? "Loading live voting data..." : "No live voting data available yet."}
            columns={[
              {
                header: "Post",
                key: "postTitle",
                render: (post) => (
                  <Grid cols={1} gap="2px">
                    <Text as="span" weight="semibold">{post.postTitle}</Text>
                    <span style={mutedTextStyle}>{post.verifiedCandidateCount || 0} verified candidate(s)</span>
                  </Grid>
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
          <HStack gap="8px" align="center" justify="end" wrap style={{ marginBottom: "var(--spacing-3)" }}>
            <Button
              size="sm"
              variant="secondary"
              onClick={onOpenTestEmailRecipients}
            >
              View Test Email Status
            </Button>
            <Button
              size="sm"
              onClick={onSendTestEmails}
              loading={busyKey === `test-email:${selectedAdminElectionId}`}
              disabled={["queued", "running"].includes(String(selectedAdminElection?.testEmailDispatch?.status || ""))}
            >
              Send Test Email
            </Button>
          </HStack>

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
              <span style={compactStatLabelStyle}>Link Sending Starts</span>
              <span style={compactStatValueStyle}>
                {selectedAdminElection?.votingAccess?.autoSendEnabled === false || !emailVotingEnabled
                  ? "Configured manual window"
                  : formatDateTime(
                      selectedAdminElection.timeline?.votingEmailStartAt ||
                        (selectedAdminElection.timeline?.votingStartAt
                          ? new Date(new Date(selectedAdminElection.timeline.votingStartAt).getTime() - 6 * 60 * 60 * 1000)
                          : null)
                    )}
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
              <span style={compactStatLabelStyle}>Mode</span>
              <span style={compactStatValueStyle}>
                {selectedAdminElection?.mockSettings?.enabled ? "Mock" : "Live"}
              </span>
            </div>
            <div style={compactStatStyle}>
              <span style={compactStatLabelStyle}>Mock Voters</span>
              <span style={compactStatValueStyle}>
                {selectedAdminElection?.mockSettings?.enabled
                  ? (selectedAdminElection?.mockSettings?.voterRollNumbers || []).length
                  : "—"}
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
            <div style={compactStatStyle}>
              <span style={compactStatLabelStyle}>Test Email Status</span>
              <span style={compactStatValueStyle}>
                {formatStageLabel(selectedAdminElection?.testEmailDispatch?.status || "idle")}
              </span>
            </div>
            <div style={compactStatStyle}>
              <span style={compactStatLabelStyle}>Test Emails Sent</span>
              <span style={compactStatValueStyle}>
                {selectedAdminElection?.testEmailDispatch?.sentRecipients || 0}
              </span>
            </div>
          </div>

          <Grid cols={1} gap={2} style={{ border: "1px solid var(--color-border-primary)", borderRadius: "var(--radius-card-sm)", backgroundColor: "var(--color-bg-secondary)", padding: "var(--spacing-3)" }}>
            <Text as="div" weight="semibold" color="heading">
              Copy Election
            </Text>
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
          </Grid>
        </>
      ) : null}

      <LiveVotingFullscreenModal
        isOpen={showVotingFullscreen && isVotingOperationsOpen}
        onClose={() => setShowVotingFullscreen(false)}
        electionTitle={selectedAdminElection?.title}
        liveVotingStats={liveVotingStats}
        loadingVotingStats={loadingVotingStats}
        socketConnected={socketConnected}
        formatDateTime={formatDateTime}
      />
    </>
  )
}

export default AdminElectionWorkspace
