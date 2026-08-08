/**
 * Accommodation UI kit — the shared pieces the accommodation screens compose
 * from. Sections are hzero's DetailSection; the rest is the domain-specific
 * furniture (person cells, meta bar, charges, journey timeline).
 */

import { Avatar, Badge, DetailSection, Divider, HStack, InfoRow, StatusBadge, Text, VStack } from "hzero"
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

// ---- Section card --------------------------------------------------------

// The accent each caller asks for, expressed as one of DetailSection's tones.
// Anything else — a plain text colour, say — reads as no accent at all.
const TONE_FOR_ACCENT = {
  "var(--color-primary)": "primary",
  "var(--color-info)": "info",
  "var(--color-success)": "success",
  "var(--color-warning)": "warning",
  "var(--color-danger)": "danger",
}

/**
 * A titled section. Kept under this name because the accommodation screens
 * import it from here; it is now a thin adapter over hzero's DetailSection,
 * which owns the panel, the padding and the heading.
 *
 * `allowOverflow` is still accepted from older call sites and ignored:
 * DetailSection never clips, so a dropdown inside a section is free either way.
 */
export const SectionCard = ({ icon, title, accentColor = "var(--color-primary)", headerAction, children }) => (
  <DetailSection icon={icon} title={title} tone={TONE_FOR_ACCENT[accentColor] || "neutral"} actions={headerAction}>
    {children}
  </DetailSection>
)

// InfoRow now lives in hzero, but the accommodation screens import it from
// here. `export { X } from "…"` would re-export without binding X in this
// module's own scope, and ChargesRows below renders <InfoRow>. Import it, then
// export the binding.
export { InfoRow }

export const PersonCard = ({ person, fallbackName }) => {
  const name = person?.name || fallbackName || "—"
  const meta = [person?.rollNumber, person?.department, person?.degree].filter(Boolean).join(" · ")
  return (
    <HStack gap={3} align="center">
      <Avatar
        src={person?.profileImage ? getMediaUrl(person.profileImage) : undefined}
        alt={name}
        name={name}
        size="large"
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text as="div" weight="semibold" color="primary">{name}</Text>
        {meta && <Text as="div" size="xs" color="muted">{meta}</Text>}
        {(person?.email || person?.phone) && (
          <Text as="div" size="xs" color="muted" truncate>
            {[person?.email, person?.phone].filter(Boolean).join(" · ")}
          </Text>
        )}
        {person?.hostel && <Text as="div" size="xs" color="muted">{person.hostel}{person.displayRoom ? ` · Room ${person.displayRoom}` : ""}</Text>}
      </div>
    </HStack>
  )
}

// Compact requester cell for staff tables (avatar + name + roll/department).
export const ApplicantCell = ({ request }) => {
  const s = request?.student
  const name = s?.name || request?.applicantName || "—"
  const meta = [s?.rollNumber, s?.department].filter(Boolean).join(" · ")
  return (
    <HStack gap="var(--spacing-2-5)" align="center" style={{ minWidth: 0 }}>
      <Avatar
        src={s?.profileImage ? getMediaUrl(s.profileImage) : undefined}
        alt={name}
        name={name}
        size="small"
      />
      <div style={{ minWidth: 0 }}>
        <Text as="div" weight="medium" color="body" truncate>{name}</Text>
        {meta && <Text as="div" size="xs" color="muted" truncate>{meta}</Text>}
      </div>
    </HStack>
  )
}

// Two-line stay cell: date range over a nights sub-label.
export const StayCell = ({ request }) => (
  <div style={{ minWidth: 0 }}>
    <Text as="div" color="body" style={{ whiteSpace: "nowrap" }}>{fmtDate(request?.stay?.fromDate)} → {fmtDate(request?.stay?.toDate)}</Text>
    <Text as="div" size="xs" color="muted">{request?.nights || 0} night(s)</Text>
  </div>
)

export const MetaBar = ({ request, actions }) => (
  <HStack
    align="center"
    justify="between"
    gap={2}
    wrap
    style={{ paddingBottom: "var(--spacing-3)", borderBottom: "var(--border-1) solid var(--color-border-light)" }}
  >
    <HStack gap={2} align="center" wrap>
      <Badge size="small" style={{ fontFamily: "var(--font-family-mono)" }}>{shortId(request._id || request.id)}</Badge>
      <StatusBadge status={request.status} tone={getStatusTone(request.status)}>{request.status}</StatusBadge>
      <Badge variant="primary" size="small" icon={<CalendarDays />}>{fmtDate(request.stay?.fromDate)} → {fmtDate(request.stay?.toDate)}</Badge>
      <Badge size="small" icon={<Users />}>{request.persons ?? (request.guests?.length || 0)} guest(s)</Badge>
    </HStack>
    {actions && <HStack gap={2}>{actions}</HStack>}
  </HStack>
)

// ---- Charges + guest list (compose inside SectionCard) -------------------

export const ChargesRows = ({ quote = {} }) => (
  <VStack gap={2}>
    <InfoRow label={`${quote.persons || 0} guest(s) × ${quote.nights || 0} night(s)`} value={money(quote.subtotal)} />
    <InfoRow label={`GST (${quote.gstPercentage || 0}%)`} value={money(quote.gstAmount)} />
    <Divider spacing="none" />
    <InfoRow label="Total" value={money(quote.total)} strong />
  </VStack>
)

export const GuestList = ({ guests = [] }) => (
  <VStack gap={2}>
    {guests.map((g, i) => (
      <HStack gap={2} align="center" key={i}>
        <Avatar name={g.name || "?"} alt={g.name || ""} size="xsmall" />
        <Text as="span" size="sm" color="body">
          {g.name} <Text as="span" color="muted">· {g.gender}{g.relation ? ` · ${g.relation}` : ""}</Text>
        </Text>
      </HStack>
    ))}
  </VStack>
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
    <VStack gap="none">
      {STUDENT_STEPS.map((step, i) => {
        const s = stateOf(i)
        const c = colorFor(s)
        const ts = stampFor(step)
        const last = i === STUDENT_STEPS.length - 1 && !terminalNegative
        return (
          <HStack gap={3} key={step.key}>
            <VStack gap="none" align="center">
              <span style={{ width: 12, height: 12, borderRadius: "var(--radius-full)", marginTop: 2, backgroundColor: s === "upcoming" ? "transparent" : c, border: `var(--border-2) solid ${c}`, boxShadow: s === "current" ? "0 0 0 4px color-mix(in srgb, var(--color-primary) 16%, transparent)" : "none", flexShrink: 0 }} />
              {!last && <span style={{ width: 2, flex: 1, minHeight: 20, backgroundColor: doneSet.has(i) ? "var(--color-success)" : "var(--color-border-light)" }} />}
            </VStack>
            <div style={{ paddingBottom: "var(--spacing-3)" }}>
              <Text as="div" size="sm" weight={s === "upcoming" ? "normal" : "semibold"} color={s === "upcoming" ? "muted" : "primary"}>{step.label}</Text>
              {ts && <Text as="div" size="2xs" color="muted">{fmtDateTime(ts)}</Text>}
            </div>
          </HStack>
        )
      })}
      {terminalNegative && (
        <HStack gap={3}>
          <span style={{ width: 12, height: 12, borderRadius: "var(--radius-full)", marginTop: 2, backgroundColor: "var(--color-danger)", border: "var(--border-2) solid var(--color-danger)", flexShrink: 0 }} />
          <Text as="div" size="sm" weight="semibold" color="danger">{status}</Text>
        </HStack>
      )}
    </VStack>
  )
}
