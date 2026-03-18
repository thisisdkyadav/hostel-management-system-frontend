import { useEffect, useState } from "react"
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

const ElectionSupportConfirmationPage = () => {
  const { token } = useParams()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [data, setData] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const response = await electionsApi.getSupporterConfirmation(token)
        setData(response?.data || null)
      } catch (err) {
        setError(err?.message || "Unable to load this confirmation request")
      } finally {
        setLoading(false)
      }
    }

    if (!token) {
      setError("Invalid confirmation link")
      setLoading(false)
      return
    }

    load()
  }, [token])

  const respond = async (decision) => {
    try {
      setSubmitting(true)
      setError("")
      const response = await electionsApi.respondToSupporterConfirmation(token, { decision })
      setSuccessMessage(response?.message || "Response saved")
      const refreshed = await electionsApi.getSupporterConfirmation(token)
      setData(refreshed?.data || null)
    } catch (err) {
      setError(err?.message || "Unable to submit your response")
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
            Loading support request...
          </div>
        </Card>
      </div>
    )
  }

  const tokenState = data?.tokenState || "invalid"
  const nomination = data?.nomination || null
  const canRespond = tokenState === "active" && !successMessage

  return (
    <div style={pageShellStyle}>
      <Card style={{ width: "100%", maxWidth: "680px", padding: "var(--spacing-7)" }}>
        <div style={{ display: "grid", gap: "var(--spacing-5)" }}>
          <div style={{ display: "grid", gap: "6px" }}>
            <h1 style={{ margin: 0, fontSize: "var(--font-size-2xl)" }}>Election Support Confirmation</h1>
            <div style={{ color: "var(--color-text-muted)" }}>
              Review the nomination details below and confirm your response.
            </div>
          </div>

          {error ? <Alert type="error">{error}</Alert> : null}
          {successMessage ? <Alert type="success">{successMessage}</Alert> : null}
          {tokenState === "expired" ? <Alert type="warning">This confirmation link has expired.</Alert> : null}
          {tokenState === "used" && !successMessage ? (
            <Alert type="info">This confirmation request has already been completed.</Alert>
          ) : null}
          {tokenState === "invalidated" ? (
            <Alert type="warning">This confirmation request is no longer active.</Alert>
          ) : null}

          {nomination ? (
            <div
              style={{
                display: "grid",
                gap: "var(--spacing-4)",
                border: "1px solid var(--color-border-primary)",
                borderRadius: "var(--radius-xl)",
                padding: "var(--spacing-5)",
              }}
            >
              <div style={{ display: "flex", gap: "var(--spacing-4)", alignItems: "center" }}>
                {nomination.candidateProfileImage ? (
                  <img
                    src={getMediaUrl(nomination.candidateProfileImage)}
                    alt={nomination.candidateName}
                    style={{
                      width: "72px",
                      height: "72px",
                      borderRadius: "var(--radius-full)",
                      objectFit: "cover",
                    }}
                  />
                ) : null}
                <div style={{ display: "grid", gap: "4px" }}>
                  <div style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-lg)" }}>
                    {nomination.candidateName}
                  </div>
                  <div style={{ color: "var(--color-text-muted)" }}>{nomination.candidateRollNumber}</div>
                  <div style={{ color: "var(--color-text-muted)" }}>
                    {nomination.postTitle} · {data?.election?.title}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "var(--spacing-3)",
                }}
              >
                <div>
                  <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Support role</div>
                  <div style={{ fontWeight: "var(--font-weight-medium)" }}>
                    {nomination.supportType === "proposer" ? "Proposer" : "Seconder"}
                  </div>
                </div>
                <div>
                  <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Requested for</div>
                  <div style={{ fontWeight: "var(--font-weight-medium)" }}>{nomination.supporter?.name || "You"}</div>
                </div>
                <div>
                  <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Current status</div>
                  <div style={{ fontWeight: "var(--font-weight-medium)" }}>{nomination.supporter?.status || "Pending"}</div>
                </div>
              </div>
            </div>
          ) : null}

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {canRespond ? (
              <>
                <Button onClick={() => respond("accepted")} loading={submitting}>
                  Accept
                </Button>
                <Button variant="danger" onClick={() => respond("rejected")} loading={submitting}>
                  Reject
                </Button>
              </>
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

export default ElectionSupportConfirmationPage
