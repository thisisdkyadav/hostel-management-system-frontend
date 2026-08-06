import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Button } from "czero/react"
import { Alert, Card, Grid, Heading, HStack, Spinner, Text } from "@/components/ui"
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
          <Text as="div" color="muted" style={{ marginTop: "var(--spacing-4)" }}>
            Loading support request...
          </Text>
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
        <Grid cols={1} gap={5}>
          <Grid cols={1} gap="6px">
            <Heading as="h1" size="2xl" style={{ margin: 0 }}>Election Support Confirmation</Heading>
            <Text as="div" color="muted">
              Review the nomination details below and confirm your response.
            </Text>
          </Grid>

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
            <Grid cols={1} gap={4} style={{ border: "1px solid var(--color-border-primary)", borderRadius: "var(--radius-xl)", padding: "var(--spacing-5)" }}>
              <HStack gap={4} align="center">
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
                <Grid cols={1} gap="4px">
                  <Text as="div" weight="semibold" size="lg">
                    {nomination.candidateName}
                  </Text>
                  <Text as="div" color="muted">{nomination.candidateRollNumber}</Text>
                  <Text as="div" color="muted">
                    {nomination.postTitle} · {data?.election?.title}
                  </Text>
                </Grid>
              </HStack>

              <Grid min={180} gap={3}>
                <div>
                  <Text as="div" color="muted" size="sm">Support role</Text>
                  <Text as="div" weight="medium">
                    {nomination.supportType === "proposer" ? "Proposer" : "Seconder"}
                  </Text>
                </div>
                <div>
                  <Text as="div" color="muted" size="sm">Requested for</Text>
                  <Text as="div" weight="medium">{nomination.supporter?.name || "You"}</Text>
                </div>
                <div>
                  <Text as="div" color="muted" size="sm">Current status</Text>
                  <Text as="div" weight="medium">{nomination.supporter?.status || "Pending"}</Text>
                </div>
              </Grid>
            </Grid>
          ) : null}

          <HStack gap="12px" wrap>
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
          </HStack>
        </Grid>
      </Card>
    </div>
  )
}

export default ElectionSupportConfirmationPage
