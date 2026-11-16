import { useEffect, useMemo, useState } from "react"
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Checkbox,
  DatePicker,
  Field,
  Grid,
  HStack,
  IconButton,
  InfoRow,
  Input,
  Modal,
  Select,
  Text,
  Textarea,
  ToggleButtonGroup,
  VStack,
} from "hzero"
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarRange,
  Check,
  ListChecks,
  Lock,
  Mail,
  Plus,
  Receipt,
  Trash2,
  Users,
} from "lucide-react"
import { accommodationApi } from "@/service"
import { PAYMENT_STATUS, STANDARD_CHECK_TIME } from "@/constants/accommodationStatus"
import { getMediaUrl } from "../../utils/mediaUtils"
import { money, fmtDate } from "./AccommodationKit"

/**
 * Chief Warden Office editor for a visitor accommodation request.
 *
 * Everything about the booking can be changed here — stay, guests, hostels,
 * charges, faculty advisor — except the student, whose details are a snapshot
 * of their own profile. The editor is split into sections (left rail) that
 * mark themselves once edited, and saving goes through a review step listing
 * every change before → after, so the office sees exactly what the student
 * will be told. Only changed parts are sent, so the student's email names only
 * what really changed.
 *
 * Money rules (enforced by the server, explained here):
 *  - before the payment request: charges are a draft, nothing is billed
 *  - payment requested, not paid: the open bill is replaced
 *  - paid: the original bill is locked; an extra amount opens a second payment
 */

const GENDERS = ["Male", "Female", "Other"].map((value) => ({ value, label: value }))
const ROOM_PREFERENCES = ["Single", "Double"].map((value) => ({ value, label: value }))
const PAYMENT_STAGE_STATUSES = ["Payment Requested", "Payment Deferred", "Payment Submitted", "Payment Verified"]

const toYmd = (d) => {
  if (!d) return ""
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return ""
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`
}
const nightsBetween = (from, to) => {
  if (!from || !to) return 0
  const n = Math.round((new Date(`${to}T00:00:00`) - new Date(`${from}T00:00:00`)) / 86400000)
  return n > 0 ? n : 0
}
const emptyGuest = () => ({ name: "", gender: "", age: "", relation: "", aadharNumber: "", remarks: "" })
const lineTotal = (c) => {
  const price = Number(c?.price) || 0
  return price + (price * (Number(c?.gstPercentage) || 0)) / 100
}
const idOf = (v) => (v && typeof v === "object" && v._id ? String(v._id) : v ? String(v) : "")

const hostelForGuest = (request, i) => {
  const rows = request?.guestAllotments || []
  if (rows.length) return idOf(rows.find((a) => Number(a.guestIndex) === i)?.hostelId)
  return idOf(request?.allotment?.hostelId)
}

const fromRequest = (request) => ({
  facultyAdvisorEmail: request?.facultyAdvisorEmail || "",
  permanentAddress: request?.permanentAddress || "",
  roomPreference: request?.roomPreference || "",
  stay: {
    fromDate: toYmd(request?.stay?.fromDate),
    toDate: toYmd(request?.stay?.toDate),
    checkInTime: request?.stay?.checkInTime || STANDARD_CHECK_TIME,
    checkOutTime: request?.stay?.checkOutTime || STANDARD_CHECK_TIME,
    purpose: request?.stay?.purpose || "",
  },
  guests: (request?.guests || []).map((g) => ({
    name: g.name || "",
    gender: g.gender || "",
    age: g.age === 0 || g.age ? String(g.age) : "",
    relation: g.relation || "",
    aadharNumber: g.aadharNumber || "",
    remarks: g.remarks || "",
  })),
  hostels: (request?.guests || []).map((_, i) => hostelForGuest(request, i)),
  charges: (request?.guests || []).map((_, i) => {
    const c = request?.quote?.guestCharges?.find((x) => Number(x.guestIndex) === i)
    return {
      price: c?.price != null && Number.isFinite(Number(c.price)) ? String(c.price) : "",
      gstPercentage: c?.gstPercentage != null ? String(c.gstPercentage) : "0",
    }
  }),
  extraAmount: "",
  extraLabel: "",
  billRemarks: "",
})

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

// ---- small building blocks ---------------------------------------------------

const Panel = ({ children, style }) => (
  <div
    style={{
      padding: "var(--spacing-4)",
      border: "var(--border-1) solid var(--color-border-primary)",
      borderRadius: "var(--radius-lg)",
      background: "var(--color-bg-primary)",
      ...style,
    }}
  >
    {children}
  </div>
)

const SectionHead = ({ title, hint }) => (
  <VStack gap={1} style={{ marginBottom: "var(--spacing-1)" }}>
    <Text size="lg" weight="semibold" color="primary">{title}</Text>
    {hint && <Text size="sm" color="muted">{hint}</Text>}
  </VStack>
)

const LockedNote = ({ children }) => (
  <HStack gap={2} align="start" style={{ padding: "var(--spacing-3)", borderRadius: "var(--radius-md)", background: "var(--color-bg-tertiary)" }}>
    <Lock size={16} style={{ flexShrink: 0, marginTop: 2, color: "var(--color-text-muted)" }} />
    <Text size="sm" color="muted">{children}</Text>
  </HStack>
)

// Narrow screens stack the section rail above the form.
const useNarrow = (px = 760) => {
  const query = `(max-width: ${px}px)`
  const [narrow, setNarrow] = useState(() => typeof window !== "undefined" && window.matchMedia?.(query).matches)
  useEffect(() => {
    const m = window.matchMedia?.(query)
    if (!m) return
    const on = (e) => setNarrow(e.matches)
    m.addEventListener("change", on)
    return () => m.removeEventListener("change", on)
  }, [query])
  return narrow
}

// ---- the editor ----------------------------------------------------------------

const AccommodationOfficeEdit = ({ open, request, onClose, onSaved, priceOptions = [], gstOptions = [] }) => {
  const [form, setForm] = useState(() => fromRequest(request))
  const [section, setSection] = useState("stay")
  const [reviewing, setReviewing] = useState(false)
  const [note, setNote] = useState("")
  const [notify, setNotify] = useState(true)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [hostels, setHostels] = useState([])
  const [pricing, setPricing] = useState({ priceOptions, gstOptions })
  const narrow = useNarrow()

  const requestId = request?._id || request?.id
  const initial = useMemo(() => fromRequest(request), [request])

  // A fresh form every time the editor opens on a request. The reset belongs
  // in the same commit as the new request, so the effect sets state directly.
  useEffect(() => {
    if (!open || !request) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(fromRequest(request))
    setSection("stay")
    setReviewing(false)
    setNote("")
    setNotify(true)
    setError("")
  }, [open, request])

  // Hostel availability + price presets (the Chief Warden Office endpoint).
  useEffect(() => {
    if (!open || !requestId) return
    let live = true
    accommodationApi
      .getAllotmentAvailability(requestId)
      .then((res) => {
        if (!live) return
        setHostels(res?.data?.hostels || [])
        setPricing({
          priceOptions: res?.data?.pricing?.priceOptions || priceOptions,
          gstOptions: res?.data?.pricing?.gstOptions || gstOptions,
        })
      })
      .catch(() => live && setHostels([]))
    return () => {
      live = false
    }
    // Presets passed in are only a fallback; refetch only for a new request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, requestId])

  if (!open || !request) return null

  // ---- stage of the booking ----
  const payment = request.payment || {}
  const paymentRequested = Number(payment.amount) > 0 || PAYMENT_STAGE_STATUSES.includes(request.status)
  const paidLocked = [PAYMENT_STATUS.SUBMITTED, PAYMENT_STATUS.VERIFIED].includes(payment.status)
  const openBill = paymentRequested && !paidLocked
  const roomsAssigned = (request.rooms?.length || request.assignedRooms?.length || 0) > 0
  const allotted = (request.guests || []).some((_, i) => hostelForGuest(request, i))
  const openExtra = (request.additionalPayments || []).find((p) => p.status === PAYMENT_STATUS.PENDING)
  const student = request.student || {}

  // ---- form helpers ----
  const set = (patch) => setForm((f) => ({ ...f, ...patch }))
  const setStay = (k, v) => setForm((f) => ({ ...f, stay: { ...f.stay, [k]: v } }))
  const setGuest = (i, k, v) => setForm((f) => ({ ...f, guests: f.guests.map((g, j) => (j === i ? { ...g, [k]: v } : g)) }))
  const setHostel = (i, v) => setForm((f) => ({ ...f, hostels: f.hostels.map((h, j) => (j === i ? v : h)) }))
  const setCharge = (i, patch) => setForm((f) => ({ ...f, charges: f.charges.map((c, j) => (j === i ? { ...c, ...patch } : c)) }))
  const addGuest = () =>
    setForm((f) => ({
      ...f,
      guests: [...f.guests, emptyGuest()],
      hostels: [...f.hostels, f.hostels[f.hostels.length - 1] || ""],
      charges: [...f.charges, { ...(f.charges[f.charges.length - 1] || { price: "", gstPercentage: "0" }) }],
    }))
  const removeGuest = (i) =>
    setForm((f) => ({
      ...f,
      guests: f.guests.filter((_, j) => j !== i),
      hostels: f.hostels.filter((_, j) => j !== i),
      charges: f.charges.filter((_, j) => j !== i),
    }))

  const hostelName = (id) => hostels.find((h) => String(h.hostelId) === String(id))?.name
    || Object.entries(request.hostelNameByGuestIndex || {}).find(([i]) => hostelForGuest(request, Number(i)) === String(id))?.[1]
    || "—"
  const guestName = (g, i) => g?.name?.trim() || `Guest ${i + 1}`

  // ---- what changed ----
  const countChanged = form.guests.length !== initial.guests.length
  const changed = {
    stay: !same(form.stay, initial.stay) || form.roomPreference !== initial.roomPreference,
    guests: !same(form.guests, initial.guests) || form.permanentAddress !== initial.permanentAddress,
    hostels: allotted && !same(form.hostels, initial.hostels),
    charges:
      (!paidLocked && !same(form.charges, initial.charges)) ||
      (paidLocked && Number(form.extraAmount) > 0),
    contact: form.facultyAdvisorEmail.trim().toLowerCase() !== initial.facultyAdvisorEmail.trim().toLowerCase(),
  }

  const changes = []
  const push = (sectionKey, label, before, after) => changes.push({ section: sectionKey, label, before, after })
  if (form.stay.fromDate !== initial.stay.fromDate || form.stay.checkInTime !== initial.stay.checkInTime)
    push("stay", "Check-in", `${fmtDate(initial.stay.fromDate)} ${initial.stay.checkInTime}`, `${fmtDate(form.stay.fromDate)} ${form.stay.checkInTime}`)
  if (form.stay.toDate !== initial.stay.toDate || form.stay.checkOutTime !== initial.stay.checkOutTime)
    push("stay", "Check-out", `${fmtDate(initial.stay.toDate)} ${initial.stay.checkOutTime}`, `${fmtDate(form.stay.toDate)} ${form.stay.checkOutTime}`)
  if (form.stay.purpose !== initial.stay.purpose) push("stay", "Purpose", initial.stay.purpose || "—", form.stay.purpose || "—")
  if (form.roomPreference !== initial.roomPreference) push("stay", "Room preference", initial.roomPreference || "—", form.roomPreference || "—")
  if (countChanged) push("guests", "Number of guests", String(initial.guests.length), String(form.guests.length))
  form.guests.forEach((g, i) => {
    const before = initial.guests[i]
    if (!before) return push("guests", `Guest ${i + 1}`, "—", `Added: ${guestName(g, i)}`)
    const fields = ["name", "gender", "age", "relation", "aadharNumber", "remarks"].filter((k) => g[k] !== before[k])
    if (fields.length) {
      const labels = { name: "name", gender: "gender", age: "age", relation: "relation", aadharNumber: "Aadhaar", remarks: "remarks" }
      push("guests", guestName(g, i), guestName(before, i), `Updated ${fields.map((k) => labels[k]).join(", ")}`)
    }
  })
  initial.guests.slice(form.guests.length).forEach((g, k) => push("guests", guestName(g, form.guests.length + k), "On the request", "Removed"))
  if (form.permanentAddress !== initial.permanentAddress) push("guests", "Guests' address", initial.permanentAddress || "—", form.permanentAddress || "—")
  if (changed.hostels) {
    form.hostels.forEach((h, i) => {
      if (h !== initial.hostels[i]) push("hostels", guestName(form.guests[i], i), initial.hostels[i] ? hostelName(initial.hostels[i]) : "—", hostelName(h))
    })
  }
  const chargeTotal = form.charges.reduce((s, c) => s + lineTotal(c), 0)
  const initialChargeTotal = initial.charges.reduce((s, c) => s + lineTotal(c), 0)
  if (!paidLocked && !same(form.charges, initial.charges)) {
    push("charges", openBill ? "Amount payable" : "Draft charges", money(initialChargeTotal), money(chargeTotal))
  }
  if (paidLocked && Number(form.extraAmount) > 0) {
    push("charges", openExtra ? "Open extra payment" : "Extra payment", openExtra ? money(openExtra.amount) : "—", `${money(form.extraAmount)} · ${form.extraLabel.trim() || "Additional charge"}`)
  }
  if (changed.contact) push("contact", "Faculty advisor", initial.facultyAdvisorEmail || "—", form.facultyAdvisorEmail.trim() || "—")

  const paymentEmail = (openBill && changes.some((c) => c.section === "charges")) || (paidLocked && Number(form.extraAmount) > 0)

  // ---- validation (per section, shown on the rail and before review) ----
  const problems = {}
  const flag = (k, msg) => (problems[k] = problems[k] || msg)
  if (!form.stay.fromDate || !form.stay.toDate) flag("stay", "Choose both stay dates.")
  else if (nightsBetween(form.stay.fromDate, form.stay.toDate) < 1) flag("stay", "Check-out must be after check-in.")
  if (form.guests.length === 0) flag("guests", "At least one guest is needed.")
  form.guests.forEach((g, i) => {
    if (!g.name.trim() || !g.gender || g.age === "" || !g.relation.trim()) flag("guests", `${guestName(g, i)}: name, gender, age and relation are required.`)
    else if (!/^\d{12}$/.test(g.aadharNumber)) flag("guests", `${guestName(g, i)}: Aadhaar must be 12 digits.`)
  })
  if (allotted && form.hostels.some((h) => !h)) flag("hostels", "Choose a hostel for every guest.")
  const chargesNeeded = (openBill && (changed.charges || countChanged)) || (!paymentRequested && !same(form.charges, initial.charges))
  if (chargesNeeded && form.charges.some((c) => c.price === "" || !Number.isFinite(Number(c.price)) || Number(c.price) < 0))
    flag("charges", "Enter a price (0 or more) for every guest.")
  if (openBill && countChanged && !changed.charges) flag("charges", "The number of guests changed — set the charges for every guest.")
  if (paidLocked && form.extraAmount !== "" && !(Number(form.extraAmount) >= 0)) flag("charges", "The extra amount is not valid.")
  if (form.facultyAdvisorEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.facultyAdvisorEmail.trim())) flag("contact", "Enter a valid email.")

  // ---- request body: only what changed ----
  const buildBody = () => {
    const body = { note: note.trim() || undefined, notifyStudent: notify }
    if (!same(form.stay, initial.stay)) body.stay = form.stay
    if (form.roomPreference !== initial.roomPreference && form.roomPreference) body.roomPreference = form.roomPreference
    if (form.permanentAddress !== initial.permanentAddress) body.permanentAddress = form.permanentAddress
    if (changed.contact) body.facultyAdvisorEmail = form.facultyAdvisorEmail.trim()
    if (!same(form.guests, initial.guests)) {
      body.guests = form.guests.map((g) => ({ ...g, age: Number(g.age), aadharNumber: g.aadharNumber.replace(/\s/g, "") }))
    }
    if (allotted && (changed.hostels || countChanged)) {
      body.guestAllotments = form.hostels.map((hostelId, guestIndex) => ({ guestIndex, hostelId }))
    }
    if (!paidLocked && (!same(form.charges, initial.charges) || (openBill && countChanged))) {
      body.guestCharges = form.charges.map((c, guestIndex) => ({ guestIndex, price: Number(c.price), gstPercentage: Number(c.gstPercentage) || 0 }))
      if (openBill && form.billRemarks.trim()) body.remarks = form.billRemarks.trim()
    }
    if (paidLocked && Number(form.extraAmount) > 0) {
      body.extraAmount = Number(form.extraAmount)
      body.extraLabel = form.extraLabel.trim() || "Additional charge"
    }
    return body
  }

  const startReview = () => {
    setError("")
    const first = Object.keys(problems)[0]
    if (first) {
      setSection(first)
      setError(problems[first])
      return
    }
    setReviewing(true)
  }

  const save = async () => {
    setBusy(true)
    setError("")
    try {
      await accommodationApi.officeEdit(requestId, buildBody())
      onSaved?.()
      onClose?.()
    } catch (err) {
      setError(err?.message || "Could not save the changes.")
      setReviewing(false)
    } finally {
      setBusy(false)
    }
  }

  // ---- sections ----
  const nights = nightsBetween(form.stay.fromDate, form.stay.toDate)
  const SECTIONS = [
    { key: "stay", label: "Stay", icon: CalendarRange, summary: `${fmtDate(form.stay.fromDate)} → ${fmtDate(form.stay.toDate)} · ${nights} night${nights === 1 ? "" : "s"}` },
    { key: "guests", label: "Guests", icon: Users, summary: `${form.guests.length} guest${form.guests.length === 1 ? "" : "s"}` },
    {
      key: "hostels",
      label: "Hostels",
      icon: Building2,
      summary: !allotted ? "Not allotted yet" : roomsAssigned ? "Rooms assigned · locked" : [...new Set(form.hostels.filter(Boolean).map(hostelName))].join(", ") || "Choose",
    },
    {
      key: "charges",
      label: "Charges",
      icon: Receipt,
      summary: paidLocked ? `Paid ${money(payment.amount)}` : openBill ? `Bill ${money(chargeTotal)}` : chargeTotal > 0 ? `Draft ${money(chargeTotal)}` : "Not billed yet",
    },
    { key: "contact", label: "Faculty advisor", icon: Mail, summary: form.facultyAdvisorEmail || "Not set" },
  ]

  const rail = (
    <nav
      aria-label="Sections"
      style={
        narrow
          ? { display: "flex", gap: "var(--spacing-2)", overflowX: "auto", paddingBottom: "var(--spacing-1)" }
          : { display: "flex", flexDirection: "column", gap: "var(--spacing-1)" }
      }
    >
      {SECTIONS.map((s) => {
        const active = section === s.key
        const Icon = s.icon
        return (
          <button
            key={s.key}
            type="button"
            onClick={() => setSection(s.key)}
            aria-current={active ? "true" : undefined}
            style={{
              display: "flex",
              gap: "var(--spacing-2-5)",
              alignItems: "flex-start",
              textAlign: "left",
              padding: "var(--spacing-2-5) var(--spacing-3)",
              borderRadius: "var(--radius-md)",
              border: "var(--border-1) solid " + (active ? "var(--color-primary)" : "transparent"),
              background: active ? "color-mix(in srgb, var(--color-primary) 8%, var(--color-bg-primary))" : "transparent",
              cursor: "pointer",
              minWidth: narrow ? "11rem" : 0,
              color: "inherit",
              font: "inherit",
            }}
          >
            <Icon size={18} style={{ marginTop: 2, flexShrink: 0, color: active ? "var(--color-primary)" : "var(--color-text-muted)" }} />
            <span style={{ minWidth: 0, flex: 1 }}>
              <HStack gap={2} align="center">
                <Text size="sm" weight={active ? "semibold" : "medium"} color={active ? "primary" : "body"}>{s.label}</Text>
                {problems[s.key] ? (
                  <span title={problems[s.key]} style={{ width: 8, height: 8, borderRadius: 999, background: "var(--color-danger)" }} />
                ) : changed[s.key] ? (
                  <Badge variant="primary" size="small">Edited</Badge>
                ) : null}
              </HStack>
              <Text as="div" size="xs" color="muted" truncate>{s.summary}</Text>
            </span>
          </button>
        )
      })}
    </nav>
  )

  const presetToggle = (choices, value, onPick, label) =>
    choices.length > 1 && (
      <div style={{ marginBottom: "var(--spacing-2)" }}>
        <ToggleButtonGroup
          size="small"
          options={choices.map((p) => ({ value: String(p), label: label(p) }))}
          value={choices.some((p) => String(p) === String(value)) ? String(value) : null}
          onChange={(v) => onPick(String(v))}
        />
      </div>
    )

  const stayPanel = (
    <VStack gap={4}>
      <SectionHead title="Stay" hint={allotted && !roomsAssigned ? "New dates are checked against free beds in the allotted hostels when you save." : undefined} />
      <Grid cols={narrow ? 1 : 2} gap={3}>
        <Field label="Check-in date"><DatePicker value={form.stay.fromDate} onChange={(e) => setStay("fromDate", e.target.value)} /></Field>
        <Field label="Check-in time"><Input type="time" value={form.stay.checkInTime} onChange={(e) => setStay("checkInTime", e.target.value)} /></Field>
        <Field label="Check-out date"><DatePicker value={form.stay.toDate} min={form.stay.fromDate || undefined} onChange={(e) => setStay("toDate", e.target.value)} /></Field>
        <Field label="Check-out time"><Input type="time" value={form.stay.checkOutTime} onChange={(e) => setStay("checkOutTime", e.target.value)} /></Field>
      </Grid>
      <HStack gap={2} wrap>
        <Badge variant={nights > 0 ? "primary" : "danger"} size="small">{nights} night{nights === 1 ? "" : "s"}</Badge>
        {(form.stay.checkInTime !== STANDARD_CHECK_TIME || form.stay.checkOutTime !== STANDARD_CHECK_TIME) && (
          <Badge size="small">Outside the standard 11:00 → 11:00 day</Badge>
        )}
        {nights !== (request.nights || 0) && nights > 0 && <Badge variant="warning" size="small">Was {request.nights || 0}</Badge>}
      </HStack>
      <Field label="Purpose of visit"><Input value={form.stay.purpose} onChange={(e) => setStay("purpose", e.target.value)} /></Field>
      <Field label="Room preference">
        <ToggleButtonGroup options={ROOM_PREFERENCES} value={form.roomPreference || null} onChange={(v) => set({ roomPreference: v })} />
      </Field>
      {paidLocked && nights !== (request.nights || 0) && (
        <Alert type="info">The stay is paid. If the new dates cost more, add an extra payment under Charges.</Alert>
      )}
    </VStack>
  )

  const guestsPanel = (
    <VStack gap={4}>
      <HStack justify="between" align="start" wrap gap={2}>
        <SectionHead title="Guests" hint="Names, ages and Aadhaar as on their ID. Remarks are for the hostel (e.g. ground floor needed)." />
        <Button size="sm" variant="outline" onClick={addGuest} disabled={roomsAssigned}><Plus size={14} /> Add guest</Button>
      </HStack>
      {roomsAssigned && <LockedNote>Rooms are assigned, so guests can be corrected but not added or removed.</LockedNote>}
      {form.guests.map((g, i) => (
        <Panel key={i}>
          <VStack gap={3}>
            <HStack justify="between" align="center">
              <HStack gap={2} align="center">
                <Avatar name={g.name || "?"} alt={g.name || ""} size="small" />
                <Text weight="semibold">{guestName(g, i)}</Text>
                {!initial.guests[i] && <Badge variant="success" size="small">New</Badge>}
              </HStack>
              {!roomsAssigned && form.guests.length > 1 && (
                <IconButton icon={<Trash2 size={16} />} variant="ghost" size="small" ariaLabel={`Remove ${guestName(g, i)}`} onClick={() => removeGuest(i)} />
              )}
            </HStack>
            <Grid cols={narrow ? 1 : 2} gap={3}>
              <Field label="Full name"><Input value={g.name} onChange={(e) => setGuest(i, "name", e.target.value)} /></Field>
              <Field label="Relation to the student"><Input value={g.relation} onChange={(e) => setGuest(i, "relation", e.target.value)} /></Field>
              <Field label="Gender"><ToggleButtonGroup size="small" options={GENDERS} value={g.gender || null} onChange={(v) => setGuest(i, "gender", v)} /></Field>
              <Field label="Age"><Input inputMode="numeric" value={g.age} onChange={(e) => setGuest(i, "age", e.target.value.replace(/\D/g, "").slice(0, 3))} /></Field>
              <Field label="Aadhaar number"><Input inputMode="numeric" maxLength={12} value={g.aadharNumber} onChange={(e) => setGuest(i, "aadharNumber", e.target.value.replace(/\D/g, "").slice(0, 12))} /></Field>
              <Field label="Remarks (optional)"><Input value={g.remarks} onChange={(e) => setGuest(i, "remarks", e.target.value)} /></Field>
            </Grid>
          </VStack>
        </Panel>
      ))}
      <Field label="Guests' permanent address">
        <Textarea rows={2} value={form.permanentAddress} onChange={(e) => set({ permanentAddress: e.target.value })} />
      </Field>
    </VStack>
  )

  const hostelOptions = (current) =>
    hostels
      .filter((h) => (h.available ?? 0) > 0 || (h.availableRooms ?? 0) > 0 || String(h.hostelId) === String(current))
      .map((h) => ({ value: String(h.hostelId), label: `${h.name} · ${h.available ?? 0} bed${h.available === 1 ? "" : "s"} free` }))

  const hostelsPanel = (
    <VStack gap={4}>
      <SectionHead title="Hostels" hint="Where each guest stays. Each hostel's supervisor assigns rooms for their guests." />
      {!allotted ? (
        <LockedNote>Hostels are chosen when you send the payment request on the main screen.</LockedNote>
      ) : roomsAssigned ? (
        <>
          <LockedNote>Rooms are assigned, so hostels are locked. Ask the hostel to clear the room assignment first if a guest must move.</LockedNote>
          {(request.assignedRooms || []).map((r) => (
            <InfoRow key={String(r.roomId)} label={`Room ${r.unitNumber ? `${r.unitNumber}-` : ""}${r.roomNumber}`} value={(r.guests || []).join(", ")} />
          ))}
        </>
      ) : (
        <>
          {hostels.length > 0 && (
            <HStack gap={2} wrap>
              {hostels.map((h) => (
                <Badge key={h.hostelId} size="small" variant={(h.available ?? 0) > 0 ? "success" : "default"}>
                  {h.name}: {h.available ?? 0} beds · {h.availableRooms ?? 0} rooms free
                </Badge>
              ))}
            </HStack>
          )}
          {form.guests.map((g, i) => (
            <Field key={i} label={guestName(g, i)}>
              <Select placeholder="Select hostel" options={hostelOptions(form.hostels[i])} value={form.hostels[i] || ""} onChange={(e) => setHostel(i, e.target.value)} />
            </Field>
          ))}
          {form.guests.length > 1 && (
            <HStack gap={2} wrap>
              <Text size="sm" color="muted">Everyone to:</Text>
              {hostelOptions("").map((o) => (
                <Button key={o.value} size="sm" variant="ghost" onClick={() => set({ hostels: form.guests.map(() => o.value) })}>
                  {o.label.split(" · ")[0]}
                </Button>
              ))}
            </HStack>
          )}
          <Text size="xs" color="muted">Free beds are for the current dates and leave out this booking's own beds. Saving checks again.</Text>
        </>
      )}
    </VStack>
  )

  const chargeLines = (
    <VStack gap={3}>
      {form.guests.map((g, i) => {
        const c = form.charges[i] || { price: "", gstPercentage: "0" }
        return (
          <Panel key={i} style={{ padding: "var(--spacing-3)" }}>
            <HStack justify="between" align="center" style={{ marginBottom: "var(--spacing-2)" }}>
              <Text size="sm" weight="semibold">{guestName(g, i)}</Text>
              <Text size="sm" weight="semibold">{money(lineTotal(c))}</Text>
            </HStack>
            <Grid cols={narrow ? 1 : 2} gap={3}>
              <Field label="Price for the stay (₹)">
                {presetToggle([...pricing.priceOptions.filter((p) => Number(p) !== 0), 0], c.price, (v) => setCharge(i, { price: v }), (p) => (Number(p) === 0 ? "₹0" : money(p)))}
                <Input type="number" min={0} step="0.01" value={c.price} onChange={(e) => setCharge(i, { price: e.target.value })} />
              </Field>
              <Field label="GST %">
                {presetToggle(pricing.gstOptions, c.gstPercentage, (v) => setCharge(i, { gstPercentage: v }), (p) => `${p}%`)}
                <Input type="number" min={0} step="0.01" value={c.gstPercentage} onChange={(e) => setCharge(i, { gstPercentage: e.target.value })} />
              </Field>
            </Grid>
          </Panel>
        )
      })}
      <Panel style={{ background: "var(--color-bg-tertiary)" }}>
        <InfoRow label="Before" value={money(initialChargeTotal)} />
        <InfoRow label={openBill ? "New amount payable" : "New draft total"} value={money(chargeTotal)} strong />
      </Panel>
    </VStack>
  )

  const chargesPanel = (
    <VStack gap={4}>
      <SectionHead
        title="Charges"
        hint={
          paidLocked
            ? "The student has paid. The original bill stays as it is; charge anything more as an extra payment."
            : openBill
              ? "The student has not paid yet. Saving replaces the open bill and emails the new amount."
              : "Not billed yet. These are draft charges; the student is asked to pay only when you send the payment request."
        }
      />
      {paidLocked ? (
        <>
          <Panel style={{ background: "var(--color-bg-tertiary)" }}>
            <HStack gap={2} align="center" style={{ marginBottom: "var(--spacing-2)" }}>
              <Lock size={14} />
              <Text size="sm" weight="semibold">Original bill · {payment.status}</Text>
            </HStack>
            {(request.quote?.guestCharges || []).map((c, i) => (
              <InfoRow key={i} label={`${c.guestName || `Guest ${i + 1}`} · ${money(c.price)} + ${c.gstPercentage || 0}% GST`} value={money(c.total)} />
            ))}
            <InfoRow label="Paid" value={money(payment.amount)} strong />
          </Panel>
          <Panel>
            <VStack gap={3}>
              <Text size="sm" weight="semibold">{openExtra ? `Open extra payment: ${money(openExtra.amount)} (${openExtra.label || "Additional charge"})` : "Extra payment"}</Text>
              <Text size="sm" color="muted">
                {openExtra ? "Entering an amount replaces this unpaid extra payment." : "Enter an amount to email the student a second payment request. Leave blank for no extra charge."}
              </Text>
              <Grid cols={narrow ? 1 : 2} gap={3}>
                <Field label="Amount (₹)"><Input type="number" min={0} step="0.01" placeholder="0" value={form.extraAmount} onChange={(e) => set({ extraAmount: e.target.value })} /></Field>
                <Field label="What it is for"><Input placeholder="e.g. Extra nights" value={form.extraLabel} onChange={(e) => set({ extraLabel: e.target.value })} /></Field>
              </Grid>
            </VStack>
          </Panel>
        </>
      ) : (
        <>
          {chargeLines}
          {openBill && (
            <Field label="Remarks on the bill (optional)">
              <Textarea rows={2} placeholder="e.g. different rate for a child" value={form.billRemarks} onChange={(e) => set({ billRemarks: e.target.value })} />
            </Field>
          )}
        </>
      )}
    </VStack>
  )

  const contactPanel = (
    <VStack gap={4}>
      <SectionHead title="Faculty advisor" hint="The faculty member who recommends this stay." />
      <Field label="Faculty advisor email">
        <Input type="email" value={form.facultyAdvisorEmail} onChange={(e) => set({ facultyAdvisorEmail: e.target.value })} placeholder="advisor@iiti.ac.in" />
      </Field>
    </VStack>
  )

  const panels = { stay: stayPanel, guests: guestsPanel, hostels: hostelsPanel, charges: chargesPanel, contact: contactPanel }

  // ---- review step ----
  const reviewView = (
    <VStack gap={4}>
      <SectionHead title="Review changes" hint="Check each change before saving. The student gets one email that lists them." />
      {SECTIONS.filter((s) => changes.some((c) => c.section === s.key)).map((s) => (
        <Panel key={s.key}>
          <HStack gap={2} align="center" style={{ marginBottom: "var(--spacing-2)" }}>
            <s.icon size={16} style={{ color: "var(--color-primary)" }} />
            <Text weight="semibold">{s.label}</Text>
            <Button size="sm" variant="ghost" onClick={() => { setSection(s.key); setReviewing(false) }} style={{ marginLeft: "auto" }}>Edit</Button>
          </HStack>
          <VStack gap={2}>
            {changes.filter((c) => c.section === s.key).map((c, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "10rem fit-content(45%) auto minmax(0, 1fr)", gap: "var(--spacing-2)", alignItems: "baseline" }}>
                <Text size="sm" color="muted">{c.label}</Text>
                <Text size="sm" style={{ textDecoration: "line-through", color: "var(--color-text-muted)", overflowWrap: "anywhere" }}>{c.before}</Text>
                {!narrow && <ArrowRight size={14} style={{ color: "var(--color-text-muted)" }} />}
                <Text size="sm" weight="semibold" style={{ overflowWrap: "anywhere" }}>{c.after}</Text>
              </div>
            ))}
          </VStack>
        </Panel>
      ))}
      <Field label="Note for the record (optional)">
        <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Dates changed at the student's request on the phone" />
        <Text size="xs" color="muted" style={{ marginTop: "var(--spacing-1)" }}>Saved in the request's history{notify ? " and included in the student's email" : ""}.</Text>
      </Field>
      <Panel style={{ background: "var(--color-bg-tertiary)" }}>
        <VStack gap={2}>
          <Checkbox label="Email the student about these changes" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
          {paymentEmail && (
            <Text size="sm" color="muted">The student is always emailed the new payment request, whatever you choose here.</Text>
          )}
          {!notify && !paymentEmail && <Text size="sm" color="muted">Saved quietly: useful for correcting a typo.</Text>}
        </VStack>
      </Panel>
    </VStack>
  )

  const footer = (
    <HStack justify="between" align="center" gap={3} wrap style={{ width: "100%" }}>
      <HStack gap={2} align="center">
        <ListChecks size={16} style={{ color: changes.length ? "var(--color-primary)" : "var(--color-text-muted)" }} />
        <Text size="sm" color={changes.length ? "primary" : "muted"}>
          {changes.length ? `${changes.length} change${changes.length === 1 ? "" : "s"}` : "No changes yet"}
        </Text>
      </HStack>
      <HStack gap={2}>
        {reviewing ? (
          <>
            <Button variant="ghost" onClick={() => setReviewing(false)} disabled={busy}><ArrowLeft size={16} /> Back to editing</Button>
            <Button onClick={save} loading={busy} disabled={busy}><Check size={16} /> {paymentEmail ? "Save and send payment request" : "Save changes"}</Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
            <Button onClick={startReview} disabled={busy || changes.length === 0}>Review changes <ArrowRight size={16} /></Button>
          </>
        )}
      </HStack>
    </HStack>
  )

  return (
    <Modal isOpen={open} onClose={onClose} title="Edit request" width={1000} footer={footer} closeButtonVariant="button">
      <VStack gap={4}>
        {/* The student: shown, never edited here. */}
        <Panel style={{ background: "var(--color-bg-tertiary)" }}>
          <HStack gap={3} align="center" wrap>
            <Avatar src={student.profileImage ? getMediaUrl(student.profileImage) : undefined} name={student.name || request.applicantName || "?"} alt="" size="medium" />
            <div style={{ flex: 1, minWidth: "12rem" }}>
              <Text as="div" weight="semibold">{student.name || request.applicantName || "Student"}</Text>
              <Text as="div" size="xs" color="muted">
                {[student.rollNumber, request.applicantEmail, request.applicantPhone].filter(Boolean).join(" · ")}
              </Text>
            </div>
            <Badge size="small" icon={<Lock />}>Student details · from their profile</Badge>
          </HStack>
        </Panel>

        {error && <Alert type="error">{error}</Alert>}

        {reviewing ? (
          reviewView
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "15rem 1fr", gap: "var(--spacing-5)", alignItems: "start" }}>
            {rail}
            <div style={{ minWidth: 0 }}>{panels[section]}</div>
          </div>
        )}
      </VStack>
    </Modal>
  )
}

export default AccommodationOfficeEdit
