import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Button } from "czero/react"
import { Alert, Textarea, RadioGroup, Spinner } from "@/components/ui"
import { RadioGroupItem } from "@/components/ui/form/RadioGroup"
import { FileText, UserCheck, GraduationCap } from "lucide-react"
import { accommodationApi } from "@/service"
import { SectionCard, InfoRow, GuestList, fmtDate } from "../../components/accommodation/AccommodationKit"

const Shell = ({ children }) => (
  <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg-page)", display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--spacing-4)" }}>
    <div style={{ width: "100%", maxWidth: "540px", display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>{children}</div>
  </div>
)

const AccommodationRecommendationPage = () => {
  const { token } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [data, setData] = useState(null)
  const [decision, setDecision] = useState("recommend")
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submittedStatus, setSubmittedStatus] = useState("")

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError("")
      try {
        const res = await accommodationApi.getRecommendation(token)
        if (active) setData(res?.data || null)
      } catch (err) {
        if (active) setError(err?.message || "This recommendation link is invalid or has expired.")
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [token])

  const handleSubmit = async () => {
    setSubmitting(true)
    setError("")
    try {
      const res = await accommodationApi.submitRecommendation(token, { decision, reason: reason.trim() })
      setSubmittedStatus(res?.data?.status || "Recorded")
    } catch (err) {
      setError(err?.message || "Could not submit your response. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Shell>
        <div style={{ backgroundColor: "var(--color-bg-primary)", borderRadius: "var(--radius-card)", border: "1px solid var(--color-border-primary)", padding: "var(--spacing-12)", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--spacing-3)" }}>
          <Spinner size="large" />
          <p style={{ color: "var(--color-text-muted)" }}>Loading the request…</p>
        </div>
      </Shell>
    )
  }
  if (submittedStatus) return <Shell><Alert type="success" title="Response recorded">Thank you. The student has been notified of your recommendation.</Alert></Shell>
  if (error && !data) return <Shell><Alert type="error" title="Link unavailable">{error}</Alert></Shell>
  if (data?.alreadyHandled) return <Shell><Alert type="info" title="Already processed">This request has already moved ahead and no longer needs your recommendation.</Alert></Shell>

  const request = data?.request || {}
  const student = data?.student || null
  const programme = student ? [student.degree, student.department].filter(Boolean).join(" · ") : ""
  const room = student ? [student.hostel, student.displayRoom].filter(Boolean).join(" · ") : ""

  return (
    <Shell>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "var(--font-size-2xl)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-heading)" }}>Faculty advisor recommendation</h1>
        <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", marginTop: "var(--spacing-1)" }}>
          {student?.name || request.applicantName || "A student"} has requested hostel accommodation for visitors.
        </p>
      </div>

      {student && (
        <SectionCard icon={GraduationCap} title="Student" accentColor="var(--color-primary)">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
            <InfoRow label="Name" value={student.name || "—"} />
            <InfoRow label="Roll number" value={student.rollNumber || "—"} />
            {programme && <InfoRow label="Programme" value={programme} />}
            {student.year ? <InfoRow label="Year" value={student.year} /> : null}
            {student.email && <InfoRow label="Email" value={student.email} />}
            {student.phone && <InfoRow label="Phone" value={student.phone} />}
            {room && <InfoRow label="Current room" value={room} />}
          </div>
        </SectionCard>
      )}

      <SectionCard icon={FileText} title="Request" accentColor="var(--color-primary)">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
          <InfoRow label="Requested by" value={request.applicantName || "—"} />
          <InfoRow label="Check-in" value={fmtDate(request.stay?.fromDate)} />
          <InfoRow label="Check-out" value={fmtDate(request.stay?.toDate)} />
          <InfoRow label="Nights" value={request.nights || 0} />
          <InfoRow label="Purpose" value={request.stay?.purpose || "—"} />
        </div>
        {Array.isArray(request.guests) && request.guests.length > 0 && (
          <div style={{ marginTop: "var(--spacing-3)", paddingTop: "var(--spacing-3)", borderTop: "1px solid var(--color-border-light)" }}>
            <div style={{ fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.4px", color: "var(--color-text-muted)", marginBottom: "var(--spacing-2)" }}>Guests</div>
            <GuestList guests={request.guests} />
          </div>
        )}
      </SectionCard>

      <SectionCard icon={UserCheck} title="Your recommendation" accentColor="var(--color-primary)">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
          {error && <Alert type="error">{error}</Alert>}
          <RadioGroup name="decision" value={decision} onChange={(e) => setDecision(e.target.value)}>
            <RadioGroupItem value="recommend" label="Recommend" />
            <RadioGroupItem value="decline" label="Do not recommend (returns to student)" />
          </RadioGroup>
          <Textarea name="reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Optional remarks for the student / chief warden" />
          <Button onClick={handleSubmit} loading={submitting} disabled={submitting} fullWidth>Submit recommendation</Button>
          <p style={{ fontSize: "10px", color: "var(--color-text-muted)", textAlign: "center" }}>Secure single-use link · no login required</p>
        </div>
      </SectionCard>
    </Shell>
  )
}

export default AccommodationRecommendationPage
