import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { Button } from "hzero"
import { Alert, Card, Grid, Heading, HStack, Spinner, Text } from "@/components/ui"
import { electionsApi } from "@/service"
import { getMediaUrl } from "@/utils/mediaUtils"

const pageShellStyle = {
  minHeight: "100vh",
  background: "var(--color-bg-page)",
}

const formatOneDateTime = (value) =>
  value && !Number.isNaN(value.getTime())
    ? value.toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—"

const formatVotingWindow = (election = {}) => {
  const start = election?.votingStartAt ? new Date(election.votingStartAt) : null
  const end = election?.votingEndAt ? new Date(election.votingEndAt) : null
  const now = new Date()

  if (!start || Number.isNaN(start.getTime())) {
    return "Voting time not available"
  }

  if (now.getTime() < start.getTime()) {
    return `Voting starts: ${formatOneDateTime(start)}`
  }

  if (end && !Number.isNaN(end.getTime()) && now.getTime() <= end.getTime()) {
    return `Voting ends: ${formatOneDateTime(end)}`
  }

  return "Voting ended"
}

const getClosedVotingMessage = (tokenState, election = {}) => {
  const start = election?.votingStartAt ? new Date(election.votingStartAt) : null
  const end = election?.votingEndAt ? new Date(election.votingEndAt) : null
  const now = new Date()

  if (tokenState === "inactive") {
    if (start && !Number.isNaN(start.getTime()) && now.getTime() < start.getTime()) {
      return `Voting will start on ${formatOneDateTime(start)}.`
    }
    if (end && !Number.isNaN(end.getTime()) && now.getTime() > end.getTime()) {
      return "Voting ended."
    }
    return "Voting is not active right now."
  }

  if (tokenState === "expired") {
    return "Voting ended."
  }

  return ""
}

const ElectionBallotPage = () => {
  const { token } = useParams()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [ballot, setBallot] = useState(null)
  const [selections, setSelections] = useState({})

  useEffect(() => {
    const load = async () => {
      try {
        const response = await electionsApi.getBallotByToken(token)
        const nextVotingPage = response?.data || null
        setBallot(nextVotingPage)
        setSelections(
          Object.fromEntries((nextVotingPage?.posts || []).map((post) => [post.postId, ""]))
        )
      } catch (err) {
        setError(err?.message || "Unable to load this voting page")
      } finally {
        setLoading(false)
      }
    }

    if (!token) {
      setError("Invalid voting link")
      setLoading(false)
      return
    }

    load()
  }, [token])

  const tokenState = ballot?.tokenState || "invalid"
  const posts = ballot?.posts || []
  const votingWindowLabel = formatVotingWindow(ballot?.election || {})
  const closedVotingMessage = getClosedVotingMessage(tokenState, ballot?.election || {})
  const isActiveVotingView = tokenState === "active"
  const hasCompletedSelections = useMemo(
    () => posts.length > 0 && posts.every((post) => Boolean(selections[post.postId])),
    [posts, selections]
  )

  const submitBallot = async () => {
    try {
      setSubmitting(true)
      setError("")
      const payload = {
        votes: posts.map((post) => ({
          postId: post.postId,
          candidateNominationId: selections[post.postId],
        })),
      }
      const response = await electionsApi.submitBallotByToken(token, payload)
      setSuccessMessage(response?.message || "Your vote has been submitted successfully")
      const refreshed = await electionsApi.getBallotByToken(token)
      setBallot(refreshed?.data || null)
    } catch (err) {
      setError(err?.message || "Unable to submit your vote")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ ...pageShellStyle, display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--spacing-5)" }}>
        <Card style={{ width: "100%", maxWidth: "560px", textAlign: "center", padding: "var(--spacing-8)" }}>
          <Spinner size="large" />
          <Text as="div" color="muted" style={{ marginTop: "var(--spacing-4)" }}>
            Loading voting page...
          </Text>
        </Card>
      </div>
    )
  }

  const hasStickyIdentity = isActiveVotingView && Boolean(ballot?.election?.title || ballot?.voter?.name)

  return (
    <div style={pageShellStyle}>
      {hasStickyIdentity ? (
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            borderBottom: "1px solid var(--color-border-primary)",
            backgroundColor: "color-mix(in srgb, var(--color-bg-primary) 88%, white 12%)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              maxWidth: "1120px",
              margin: "0 auto",
              padding: "12px var(--spacing-5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--spacing-3)",
              flexWrap: "wrap",
            }}
          >
            <Grid cols={1} gap="2px" style={{ minWidth: 0 }}>
              <Text as="div" size="lg" weight="semibold" color="heading">
                {ballot?.election?.title || "Election Voting Page"}
              </Text>
              <Text as="div" color="muted" size="sm">
                {votingWindowLabel}
              </Text>
            </Grid>
            {ballot?.voter?.name ? (
              <Grid cols={1} gap="2px" style={{ textAlign: "right", minWidth: 0 }}>
                <Text as="div" size="sm" weight="medium" color="heading">
                  {ballot.voter.name}
                </Text>
                <Text as="div" color="muted" size="sm">
                  {ballot.voter.rollNumber}
                </Text>
              </Grid>
            ) : null}
          </div>
        </div>
      ) : null}

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "var(--spacing-5)" }}>
        <Card style={{ width: "100%", padding: "var(--spacing-7)" }}>
          <Grid cols={1} gap={5}>
            {!hasStickyIdentity && isActiveVotingView ? (
              <Grid cols={1} gap="6px">
                <Heading as="h1" size="2xl" style={{ margin: 0 }}>
                  {ballot?.election?.title || "Election Voting Page"}
                </Heading>
                <Text as="div" color="muted">
                  {votingWindowLabel}
                </Text>
              </Grid>
            ) : null}

            {error ? <Alert type="error">{error}</Alert> : null}
            {successMessage ? <Alert type="success">{successMessage}</Alert> : null}
            {tokenState === "inactive" ? (
              <Alert type="warning">{closedVotingMessage || "Voting is not active right now."}</Alert>
            ) : null}
            {tokenState === "expired" ? (
              <Alert type="warning">{closedVotingMessage || "Voting ended."}</Alert>
            ) : null}
            {tokenState === "used" && !successMessage ? (
              <Alert type="info">Your vote has already been submitted.</Alert>
            ) : null}
            {tokenState === "invalidated" ? (
              <Alert type="warning">This voting link is no longer active.</Alert>
            ) : null}

            {posts.length > 0 ? (
              <Grid cols={1} gap={4}>
                {posts.map((post) => (
                  <Grid cols={1} gap={3} style={{ border: "1px solid var(--color-border-primary)", borderRadius: "var(--radius-xl)", padding: "var(--spacing-5)" }} key={post.postId}>
                    <Text as="div" weight="semibold" size="lg">
                      {post.postTitle}
                    </Text>

                    <Grid cols={1} gap="10px">
                      {(post.candidates || []).map((candidate) => {
                        const isSelected = selections[post.postId] === candidate.nominationId
                        return (
                          <label
                            key={candidate.nominationId}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "var(--spacing-3)",
                              border: "1px solid var(--color-border-primary)",
                              borderRadius: "var(--radius-lg)",
                              padding: "var(--spacing-3)",
                              backgroundColor: isSelected ? "var(--color-primary-bg)" : "var(--color-bg-primary)",
                              cursor: tokenState === "active" ? "pointer" : "default",
                            }}
                          >
                            <input
                              type="radio"
                              name={`ballot-${post.postId}`}
                              checked={isSelected}
                              disabled={tokenState !== "active" || Boolean(successMessage)}
                              onChange={() =>
                                setSelections((current) => ({
                                  ...current,
                                  [post.postId]: candidate.nominationId,
                                }))
                              }
                            />
                            {candidate.candidateProfileImage ? (
                              <img
                                src={getMediaUrl(candidate.candidateProfileImage)}
                                alt={candidate.candidateName}
                                style={{
                                  width: "44px",
                                  height: "44px",
                                  borderRadius: "var(--radius-full)",
                                  objectFit: "cover",
                                }}
                              />
                            ) : null}
                            <Grid cols={1} gap="2px">
                              <Text as="div" weight="medium">{candidate.candidateName}</Text>
                              {!candidate.isNota && candidate.candidateRollNumber ? (
                                <Text as="div" color="muted" size="sm">
                                  {candidate.candidateRollNumber}
                                </Text>
                              ) : null}
                            </Grid>
                          </label>
                        )
                      })}
                    </Grid>
                  </Grid>
                ))}
              </Grid>
            ) : null}

            <HStack gap="12px" wrap>
              {tokenState === "active" && !successMessage ? (
                <Button onClick={submitBallot} loading={submitting} disabled={!hasCompletedSelections}>
                  Submit Vote
                </Button>
              ) : null}
            </HStack>
          </Grid>
        </Card>
      </div>
    </div>
  )
}

export default ElectionBallotPage
