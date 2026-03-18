import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Button } from "czero/react"
import { Alert, Card, Spinner } from "@/components/ui"
import { electionsApi } from "@/service"
import { getMediaUrl } from "@/utils/mediaUtils"

const pageShellStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "var(--spacing-5)",
  background: "var(--color-bg-page)",
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
        const nextBallot = response?.data || null
        setBallot(nextBallot)
        setSelections(
          Object.fromEntries((nextBallot?.posts || []).map((post) => [post.postId, ""]))
        )
      } catch (err) {
        setError(err?.message || "Unable to load this ballot")
      } finally {
        setLoading(false)
      }
    }

    if (!token) {
      setError("Invalid ballot link")
      setLoading(false)
      return
    }

    load()
  }, [token])

  const tokenState = ballot?.tokenState || "invalid"
  const posts = ballot?.posts || []
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
      setSuccessMessage(response?.message || "Ballot submitted successfully")
      const refreshed = await electionsApi.getBallotByToken(token)
      setBallot(refreshed?.data || null)
    } catch (err) {
      setError(err?.message || "Unable to submit ballot")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={pageShellStyle}>
        <Card style={{ width: "100%", maxWidth: "560px", textAlign: "center", padding: "var(--spacing-8)" }}>
          <Spinner size="large" />
          <div style={{ marginTop: "var(--spacing-4)", color: "var(--color-text-muted)" }}>
            Loading ballot...
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div style={pageShellStyle}>
      <Card style={{ width: "100%", maxWidth: "960px", padding: "var(--spacing-7)" }}>
        <div style={{ display: "grid", gap: "var(--spacing-5)" }}>
          <div style={{ display: "grid", gap: "6px" }}>
            <h1 style={{ margin: 0, fontSize: "var(--font-size-2xl)" }}>
              {ballot?.election?.title || "Election Ballot"}
            </h1>
            <div style={{ color: "var(--color-text-muted)" }}>
              {ballot?.voter?.name ? `${ballot.voter.name} · ${ballot.voter.rollNumber}` : "Secure ballot link"}
            </div>
          </div>

          {error ? <Alert type="error">{error}</Alert> : null}
          {successMessage ? <Alert type="success">{successMessage}</Alert> : null}
          {tokenState === "inactive" ? (
            <Alert type="warning">This ballot link only works during the voting window.</Alert>
          ) : null}
          {tokenState === "expired" ? (
            <Alert type="warning">This ballot link has expired.</Alert>
          ) : null}
          {tokenState === "used" && !successMessage ? (
            <Alert type="info">This ballot has already been submitted.</Alert>
          ) : null}
          {tokenState === "invalidated" ? (
            <Alert type="warning">This ballot link is no longer active.</Alert>
          ) : null}

          {posts.length > 0 ? (
            <div style={{ display: "grid", gap: "var(--spacing-4)" }}>
              {posts.map((post) => (
                <div
                  key={post.postId}
                  style={{
                    display: "grid",
                    gap: "var(--spacing-3)",
                    border: "1px solid var(--color-border-primary)",
                    borderRadius: "var(--radius-xl)",
                    padding: "var(--spacing-5)",
                  }}
                >
                  <div style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-lg)" }}>
                    {post.postTitle}
                  </div>

                  <div style={{ display: "grid", gap: "10px" }}>
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
                          <div style={{ display: "grid", gap: "2px" }}>
                            <div style={{ fontWeight: "var(--font-weight-medium)" }}>{candidate.candidateName}</div>
                            <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                              {candidate.candidateRollNumber}
                            </div>
                            {candidate.pitch ? (
                              <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                                {candidate.pitch}
                              </div>
                            ) : null}
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {tokenState === "active" && !successMessage ? (
              <Button onClick={submitBallot} loading={submitting} disabled={!hasCompletedSelections}>
                Submit Ballot
              </Button>
            ) : null}
            <Link to="/login" style={{ textDecoration: "none" }}>
              <Button variant="secondary">Go to Login</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ElectionBallotPage
