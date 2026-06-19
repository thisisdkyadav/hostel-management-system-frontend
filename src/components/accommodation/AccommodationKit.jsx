/**
 * Accommodation UI kit — aligned to the app's shared detail patterns
 * (section cards with icon headers, meta bar, info rows, person card),
 * mirroring ComplaintDetailModal / EventDetailSectionCard.
 */

import { createElement } from "react"
import { StatusBadge } from "czero/react"
import { CalendarDays, Users } from "lucide-react"
import { getMediaUrl } from "../../utils/mediaUtils"
import {
  ACCOMMODATION_STATUS,
  getStatusTone,
  STUDENT_STEPS,
  stepIndexForStatus,
} from "@/constants/accommodationStatus"

export const money = (n) =>
  `₹${(Number(n) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const fmtDate = (d) => {
  if (!d) return "—"
  try {
    return new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })
  } catch {
    return "—"
  }
}
const fmtDateTime = (d) => {
  if (!d) return ""
  try {
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
  } catch {
    return ""
  }
}
export const shortId = (id) => `#${String(id || "").slice(-6).toUpperCase()}`

// ---- Section card (mirrors EventDetailSectionCard) -----------------------

export const SectionCard = ({ icon, title, accentColor = "var(--color-primary)", headerAction, children, allowOverflow = false }) => (
  <div style={{ background: "var(--color-bg-primary)", borderRadius: "var(--radius-card-sm)", border: "1px solid var(--color-border-primary)", overflow: allowOverflow ? "visible" : "hidden" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-2)", padding: "var(--spacing-2) var(--spacing-3)", borderBottom: "1px solid var(--color-border-primary)", backgroundColor: "var(--color-bg-secondary)", borderTopLeftRadius: "var(--radius-card-sm)", borderTopRightRadius: "var(--radius-card-sm)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
        {icon && (
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: "var(--radius-sm)", backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)`, color: accentColor }}>
            {createElement(icon, { size: 13 })}
          </span>
        )}
        <span style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-heading)", textTransform: "uppercase", letterSpacing: "0.4px" }}>{title}</span>
      </div>
      {headerAction}
    </div>
    <div style={{ padding: "var(--spacing-3)" }}>{children}</div>
  </div>
)

export const InfoRow = ({ label, value, strong }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--spacing-3)" }}>
    <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>{label}</span>
    <span style={{ fontWeight: strong ? "var(--font-weight-semibold)" : "var(--font-weight-medium)", color: "var(--color-text-body)", fontSize: strong ? "var(--font-size-base)" : "var(--font-size-sm)", textAlign: "right" }}>{value}</span>
  </div>
)

export const PersonCard = ({ person, fallbackName }) => {
  const name = person?.name || fallbackName || "—"
  const meta = [person?.rollNumber, person?.department, person?.degree].filter(Boolean).join(" · ")
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)" }}>
      {person?.profileImage ? (
        <img src={getMediaUrl(person.profileImage)} alt={name} style={{ height: 44, width: 44, borderRadius: "var(--radius-full)", objectFit: "cover", border: "2px solid var(--color-primary-bg)" }} />
      ) : (
        <div style={{ height: 44, width: 44, borderRadius: "var(--radius-full)", backgroundColor: "var(--color-primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)", fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-lg)", flexShrink: 0 }}>
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)" }}>{name}</div>
        {meta && <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>{meta}</div>}
        {(person?.email || person?.phone) && (
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {[person?.email, person?.phone].filter(Boolean).join(" · ")}
          </div>
        )}
        {person?.hostel && <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>{person.hostel}{person.displayRoom ? ` · Room ${person.displayRoom}` : ""}</div>}
      </div>
    </div>
  )
}

// Compact requester cell for staff tables (avatar + name + roll/department).
export const ApplicantCell = ({ request }) => {
  const s = request?.student
  const name = s?.name || request?.applicantName || "—"
  const meta = [s?.rollNumber, s?.department].filter(Boolean).join(" · ")
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2-5)", minWidth: 0 }}>
      {s?.profileImage ? (
        <img src={getMediaUrl(s.profileImage)} alt={name} style={{ height: 32, width: 32, borderRadius: "var(--radius-full)", objectFit: "cover", flexShrink: 0 }} />
      ) : (
        <span style={{ height: 32, width: 32, borderRadius: "var(--radius-full)", backgroundColor: "var(--color-primary-bg)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)", flexShrink: 0 }}>
          {name.charAt(0).toUpperCase()}
        </span>
      )}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
        {meta && <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{meta}</div>}
      </div>
    </div>
  )
}

// Two-line stay cell: date range over a nights sub-label.
export const StayCell = ({ request }) => (
  <div style={{ minWidth: 0 }}>
    <div style={{ color: "var(--color-text-body)", whiteSpace: "nowrap" }}>{fmtDate(request?.stay?.fromDate)} → {fmtDate(request?.stay?.toDate)}</div>
    <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>{request?.nights || 0} night(s)</div>
  </div>
)

// Chip used in the meta bar.
const Chip = ({ children, bg = "var(--color-bg-muted)", color = "var(--color-text-muted)", mono }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--spacing-1)", padding: "var(--spacing-0-5) var(--spacing-2)", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", borderRadius: "var(--radius-full)", background: bg, color, fontFamily: mono ? "monospace" : "inherit" }}>
    {children}
  </span>
)

export const MetaBar = ({ request, actions }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-2)", flexWrap: "wrap", paddingBottom: "var(--spacing-3)", borderBottom: "1px solid var(--color-border-light)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
      <Chip mono>{shortId(request._id || request.id)}</Chip>
      <StatusBadge status={request.status} tone={getStatusTone(request.status)}>{request.status}</StatusBadge>
      <Chip bg="var(--color-primary-bg)" color="var(--color-primary)"><CalendarDays size={11} />{fmtDate(request.stay?.fromDate)} → {fmtDate(request.stay?.toDate)}</Chip>
      <Chip><Users size={11} />{request.persons ?? (request.guests?.length || 0)} guest(s)</Chip>
    </div>
    {actions && <div style={{ display: "flex", gap: "var(--spacing-2)" }}>{actions}</div>}
  </div>
)

// ---- Charges + guest list (compose inside SectionCard) -------------------

export const ChargesRows = ({ quote = {} }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
    <InfoRow label={`${quote.persons || 0} guest(s) × ${quote.nights || 0} night(s)`} value={money(quote.subtotal)} />
    <InfoRow label={`GST (${quote.gstPercentage || 0}%)`} value={money(quote.gstAmount)} />
    <div style={{ height: 1, backgroundColor: "var(--color-border-light)", margin: "2px 0" }} />
    <InfoRow label="Total" value={money(quote.total)} strong />
  </div>
)

export const GuestList = ({ guests = [] }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
    {guests.map((g, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
        <span style={{ width: 26, height: 26, borderRadius: "var(--radius-full)", backgroundColor: "var(--color-primary-bg)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)", flexShrink: 0 }}>
          {(g.name || "?").charAt(0).toUpperCase()}
        </span>
        <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
          {g.name} <span style={{ color: "var(--color-text-muted)" }}>· {g.gender}{g.relation ? ` · ${g.relation}` : ""}</span>
        </span>
      </div>
    ))}
  </div>
)

// ---- Journey timeline ----------------------------------------------------

export const JourneyTimeline = ({ status, timeline = [] }) => {
  const currentIdx = stepIndexForStatus(status)
  const terminalNegative = status === ACCOMMODATION_STATUS.REJECTED || status === ACCOMMODATION_STATUS.CANCELLED

  const doneSet = new Set()
  for (const t of timeline) {
    const si = STUDENT_STEPS.findIndex((s) => s.statuses.includes(t.status))
    if (si >= 0) doneSet.add(si)
  }
  const stampFor = (step) => {
    let latest = null
    for (const t of timeline) if (step.statuses.includes(t.status)) latest = t.at
    return latest
  }
  const stateOf = (i) => (i === currentIdx ? "current" : doneSet.has(i) ? "done" : "upcoming")
  const colorFor = (s) => (s === "done" ? "var(--color-success)" : s === "current" ? "var(--color-primary)" : "var(--color-border-input)")

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {STUDENT_STEPS.map((step, i) => {
        const s = stateOf(i)
        const c = colorFor(s)
        const ts = stampFor(step)
        const last = i === STUDENT_STEPS.length - 1 && !terminalNegative
        return (
          <div key={step.key} style={{ display: "flex", gap: "var(--spacing-3)" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ width: 12, height: 12, borderRadius: "50%", marginTop: 2, backgroundColor: s === "upcoming" ? "transparent" : c, border: `2px solid ${c}`, boxShadow: s === "current" ? "0 0 0 4px color-mix(in srgb, var(--color-primary) 16%, transparent)" : "none", flexShrink: 0 }} />
              {!last && <span style={{ width: 2, flex: 1, minHeight: 20, backgroundColor: doneSet.has(i) ? "var(--color-success)" : "var(--color-border-light)" }} />}
            </div>
            <div style={{ paddingBottom: "var(--spacing-3)" }}>
              <div style={{ fontSize: "var(--font-size-sm)", fontWeight: s === "upcoming" ? 400 : 600, color: s === "upcoming" ? "var(--color-text-muted)" : "var(--color-text-primary)" }}>{step.label}</div>
              {ts && <div style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>{fmtDateTime(ts)}</div>}
            </div>
          </div>
        )
      })}
      {terminalNegative && (
        <div style={{ display: "flex", gap: "var(--spacing-3)" }}>
          <span style={{ width: 12, height: 12, borderRadius: "50%", marginTop: 2, backgroundColor: "var(--color-danger)", border: "2px solid var(--color-danger)", flexShrink: 0 }} />
          <div style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--color-danger)" }}>{status}</div>
        </div>
      )}
    </div>
  )
}
