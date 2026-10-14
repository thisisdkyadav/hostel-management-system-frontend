import { useState, useMemo } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useSearchParams } from "react-router-dom"
import { Alert, Button, Checkbox, DataTable, Field, HStack, Input, Modal, Select, StatCards, StatusBadge, Tabs, Text, Textarea, ToggleButtonGroup, VStack, useToast } from "hzero"
import { Download, Plus, ReceiptText, RefreshCw, Users } from "lucide-react"
import { useAuth } from "@/contexts/AuthProvider"
import PageHeader from "@/components/common/PageHeader"
import { h4Api } from "@/service/modules/intern-accommodation.api"
import { queryKeys } from "@/lib/query"
import { getStatusTone } from "@/constants/accommodationStatus"
import { H4Stay } from "@/components/intern-accommodation/H4Kit"
import { money } from "@/components/intern-accommodation/h4.format"
import { shortId } from "@/components/accommodation/AccommodationKit"
import H4BatchForm from "@/components/intern-accommodation/H4BatchForm"
import H4Detail from "@/components/intern-accommodation/H4Detail"
import H4ChargesModal from "@/components/intern-accommodation/H4ChargesModal"
import { BatchModal, BatchTable } from "@/components/intern-accommodation/H4Batches"
import { groupByBatch } from "@/components/intern-accommodation/h4.batches"

const VIEW_KEY = "h4.viewMode"
const readViewMode = () => {
  try {
    return localStorage.getItem(VIEW_KEY) === "individual" ? "individual" : "batches"
  } catch {
    return "batches"
  }
}

const stageFor = (r) => r.h4.amendment?.stage || r.currentStage
const isMe = (r, user) => String(r.requesterUserId) === String(user._id || user.id)
const isMyFacultyQueue = (r, user) =>
  String(r.h4.facultyUserId) === String(user._id || user.id) && stageFor(r) === "faculty"

// Same shape as the guest accommodation staff page: one lane per queue,
// `match` where a lane is not a single status.
const lanesFor = (user, options) => {
  const l = (key, label, match) => ({ key, label, match })
  const lanes = [l("all", "All", () => true), l("mine", "Mine", (r) => isMe(r, user))]
  if (options.canRecommend) lanes.push(l("faculty", "Faculty review", (r) => isMyFacultyQueue(r, user)))
  if (options.role === "Admin" && options.subRole === "Chief Warden Office")
    lanes.push(l("office", "Office review", (r) => stageFor(r) === "office"))
  if (options.role === "Admin" && options.subRole === "Chief Warden Office")
    lanes.push(l("charges", "Issue charges", (r) => r.status === "CW Approved"))
  if (options.role === "Admin" && options.subRole === "Chief Warden")
    lanes.push(l("chief", "Chief Warden", (r) => stageFor(r) === "chief"))
  if (options.role === "Admin" && options.subRole === "Accountant")
    lanes.push(
      l(
        "payments",
        "Verify payment",
        (r) => r.payment?.status === "Submitted" || r.h4.messPayment?.status === "Submitted" || (r.additionalPayments || []).some((p) => p.status === "Submitted"),
      ),
    )
  if (options.role === "Hostel Supervisor")
    lanes.push(
      l("rooms", "Assign rooms", (r) =>
        ["Payment Verified", "Rooms Assigned", "Checked In"].includes(r.status),
      ),
    )
  return lanes
}

const subtitleFor = (options) => {
  if (options.subRole === "Chief Warden") return "Review intern stay requests."
  if (options.subRole === "Chief Warden Office") return "Check capacity, set charges, allot hostels."
  if (options.subRole === "Accountant") return "Verify intern accommodation payments."
  if (options.role === "Hostel Supervisor") return "Assign rooms for intern stays."
  return "Intern and unregistered-student stays."
}

// "12 male · 8 female", plus any other/unknown genders that show up.
const genderSplit = (counts = {}) => {
  const parts = [`${counts.Male || 0} male`, `${counts.Female || 0} female`]
  for (const [g, n] of Object.entries(counts)) if (g !== "Male" && g !== "Female" && n) parts.push(`${n} ${g.toLowerCase()}`)
  return parts.join(" · ")
}
const sum = (counts = {}) => Object.values(counts).reduce((a, n) => a + n, 0)

const laneMatcher = (lane) => lane.match || (() => true)

const matchesSearch = (r, q) => {
  const s = q.trim().toLowerCase()
  if (!s) return true
  return [r.applicantName, r.applicantEmail, r.h4.institute, r.h4.facultyName, r.h4.creatorName]
    .filter(Boolean)
    .some((v) => String(v).toLowerCase().includes(s))
}

export default function InternAccommodationPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [params, setParams] = useSearchParams()
  const requestId = params.get("request")

  const listQuery = useQuery({
    queryKey: queryKeys.h4.list({ limit: 500 }),
    queryFn: () => h4Api.list({ limit: 500 }),
    select: (res) => res?.data?.items || [],
  })
  const allRequests = useMemo(() => listQuery.data || [], [listQuery.data])
  const loading = listQuery.isLoading
  const [filter, setFilter] = useState(() =>
    user.role === "Academics"
      ? "faculty"
      : user.subRole === "Chief Warden Office"
        ? "office"
        : user.subRole === "Chief Warden"
          ? "chief"
          : user.subRole === "Accountant"
            ? "payments"
            : user.role === "Hostel Supervisor"
              ? "rooms"
              : "all",
  )
  const [search, setSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState([])
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(null)
  const [viewMode, setViewModeState] = useState(readViewMode)
  const [openBatchKey, setOpenBatchKey] = useState(null)
  const [reviewIds, setReviewIds] = useState(null)
  const [chargeIds, setChargeIds] = useState(null)
  const [batchAction, setBatchAction] = useState("approve")
  const [batchConfirmed, setBatchConfirmed] = useState(false)
  const [reason, setReason] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [exportFrom, setExportFrom] = useState("")
  const [exportTo, setExportTo] = useState("")
  const [exporting, setExporting] = useState(false)

  const optionsQuery = useQuery({ queryKey: queryKeys.h4.options(), queryFn: h4Api.options })
  const options = useMemo(() => optionsQuery.data?.data || { faculty: [], hostels: [] }, [optionsQuery.data])

  const lanes = useMemo(() => lanesFor(user, options), [user, options])
  const subtitle = useMemo(() => subtitleFor(options), [options])
  const isAccountant = options.role === "Admin" && options.subRole === "Accountant"
  const isDesk = options.role === "Admin" && ["Chief Warden Office", "Chief Warden", "Accountant"].includes(options.subRole)

  const statsQuery = useQuery({
    queryKey: queryKeys.h4.stats(),
    queryFn: h4Api.stats,
    enabled: isDesk,
    select: (res) => res?.data,
  })

  const office = options.role === "Admin" && options.subRole === "Chief Warden Office"
  const chief = options.role === "Admin" && options.subRole === "Chief Warden"
  const reviewStage = office ? "office" : chief ? "chief" : options.canRecommend ? "faculty" : null

  const refreshRequests = () => queryClient.invalidateQueries({ queryKey: queryKeys.h4.all })

  const counts = useMemo(() => {
    const map = {}
    for (const lane of lanes) map[lane.key] = allRequests.filter(laneMatcher(lane)).length
    return map
  }, [lanes, allRequests])

  const tabs = useMemo(
    () => lanes.map((l) => ({ value: l.key, label: l.label, count: counts[l.key] || 0 })),
    [lanes, counts],
  )

  const statCards = useMemo(
    () => [
      ...(isDesk
        ? [
            { title: "Pending", value: sum(statsQuery.data?.pending), subtitle: genderSplit(statsQuery.data?.pending) },
            { title: "Staying now", value: sum(statsQuery.data?.active), subtitle: genderSplit(statsQuery.data?.active) },
            { title: "Total", value: sum(statsQuery.data?.total), subtitle: genderSplit(statsQuery.data?.total) },
          ]
        : [{ title: "Total", value: allRequests.length, subtitle: "Intern requests" }]),
      ...lanes
        .filter((l) => l.key !== "all" && l.key !== "mine")
        .map((l) => ({ title: l.label, value: counts[l.key] || 0, subtitle: "In queue" })),
    ],
    [lanes, counts, allRequests.length, isDesk, statsQuery.data],
  )

  const visible = useMemo(() => {
    const lane = lanes.find((l) => l.key === filter) || lanes[0]
    return allRequests.filter((r) => laneMatcher(lane)(r) && matchesSearch(r, search))
  }, [allRequests, filter, lanes, search])

  const reviewable = (r) =>
    reviewStage &&
    stageFor(r) === reviewStage &&
    (reviewStage !== "faculty" || isMyFacultyQueue(r, user)) &&
    r.h4.amendment?.stage !== "office" &&
    !(r.h4.amendment?.stage === "chief" && r.rooms.length)

  const chargeable = (r) => office && r.status === "CW Approved" && !reviewable(r)

  const setViewMode = (mode) => {
    setViewModeState(mode)
    setSelectedIds([])
    setOpenBatchKey(null)
    try {
      localStorage.setItem(VIEW_KEY, mode)
    } catch {
      /* private mode */
    }
  }

  // Students the current user can act on in bulk: review decisions or (office) issuing charges.
  const bulkIds = useMemo(() => new Set(visible.filter((r) => reviewable(r) || chargeable(r)).map((r) => r._id)), [visible, reviewStage, office, user]) // eslint-disable-line react-hooks/exhaustive-deps
  const groups = useMemo(
    () => groupByBatch(visible).map((g) => ({ ...g, eligible: g.students.filter((r) => bulkIds.has(r._id)).map((r) => r._id) })),
    [visible, bulkIds],
  )
  const openGroup = groups.find((g) => g.key === openBatchKey) || null
  const selectedKeys = useMemo(
    () => groups.filter((g) => g.eligible.length && g.eligible.every((id) => selectedIds.includes(id))).map((g) => g.key),
    [groups, selectedIds],
  )

  const onSelectionChange = (ids) => {
    setSelectedIds(ids.filter((id) => bulkIds.has(id)))
  }
  const onBatchSelectionChange = (keys) => {
    setSelectedIds(groups.filter((g) => keys.includes(g.key)).flatMap((g) => g.eligible))
  }

  const reviewList = useMemo(
    () => (reviewIds ? allRequests.filter((r) => reviewIds.includes(r._id) && reviewable(r)) : []),
    [allRequests, reviewIds, reviewStage, user], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const openDetail = async (row) => {
    setSelected(row)
    setParams((p) => {
      p.set("request", row._id)
      return p
    })
    try {
      const res = await h4Api.get(row._id)
      if (res?.data) setSelected(res.data)
    } catch {
      /* keep row data */
    }
  }

  const closeDetail = () => {
    setSelected(null)
    setParams((p) => {
      p.delete("request")
      return p
    })
  }

  // Deep link (?request=<id>) from emails — served by query, no effect needed.
  const detailQuery = useQuery({
    queryKey: queryKeys.h4.detail(requestId),
    queryFn: () => h4Api.get(requestId),
    enabled: !!requestId && (!selected || String(selected._id) !== String(requestId)),
  })
  const linkedRequest = requestId && (!selected || String(selected._id) !== String(requestId)) ? detailQuery.data?.data : null

  const refreshAfterAction = async () => {
    setSelected(null)
    setSelectedIds([])
    closeDetail()
    await refreshRequests()
  }

  const applyBatch = async () => {
    setBusy(true)
    setError("")
    try {
      const result = await h4Api.batchDecision({
        stage: reviewStage,
        action: batchAction,
        reason,
        confirmPayer: batchConfirmed,
        confirmAvailability: batchConfirmed,
        requests: reviewList.map((r) => ({ id: r._id, revision: r.h4.revision })),
      })
      const failed = (result.data.results || []).filter((r) => !r.success)
      const done = (result.data.results || []).length - failed.length
      toast.success(`${done} request${done === 1 ? "" : "s"} updated`)
      if (failed.length) {
        toast.error(`${failed.length} need attention`)
        setError(failed.map((r) => r.message).join(" "))
      } else {
        setReviewIds(null)
      }
      setSelectedIds([])
      await refreshRequests()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const exportInvoices = async () => {
    if (!exportFrom || !exportTo) {
      toast.error("Choose a start and end date.")
      return
    }
    if (exportFrom > exportTo) {
      toast.error("Start date must be on or before the end date.")
      return
    }
    setExporting(true)
    try {
      const blob = await h4Api.export({ from: exportFrom, to: exportTo })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `h4-invoices-${exportFrom}-${exportTo}.xls`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      toast.error(err?.message || "Could not export invoices.")
    } finally {
      setExporting(false)
    }
  }

  const totalOf = (r) => (r.payment?.amount || 0) + (r.additionalPayments || []).reduce((s, p) => s + p.amount, 0)

  const columns = [
    {
      key: "student",
      header: "Student",
      render: (r) => (
        <VStack gap={1}>
          <Text weight="semibold" size="sm">{r.applicantName || "—"}</Text>
          <Text size="xs" color="muted">{r.h4.institute}</Text>
        </VStack>
      ),
    },
    { key: "stay", header: "Stay", render: (r) => <H4Stay request={r} /> },
    {
      key: "hostel",
      header: "Hostel",
      render: (r) => (
        <VStack gap={1}>
          <Text size="sm">{r.hostelName || "Pending"}</Text>
          <Text size="xs" color="muted">{r.roomLabel || "Room pending"}</Text>
        </VStack>
      ),
    },
    { key: "amount", header: "Amount", align: "right", render: (r) => money(totalOf(r)) },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={r.status} tone={getStatusTone(r.status)}>{r.status}</StatusBadge>,
    },
    {
      key: "id",
      header: "ID",
      align: "right",
      render: (r) => <Text as="span" size="10px" color="muted" style={{ fontFamily: "monospace" }}>{shortId(r._id)}</Text>,
    },
  ]

  const openReview = (ids) => {
    setBatchAction("approve")
    setBatchConfirmed(false)
    setReason("")
    setError("")
    setReviewIds(ids)
  }

  const renderBulk = (students) => {
    const picked = students.filter((r) => selectedIds.includes(r._id))
    const review = picked.filter(reviewable).map((r) => r._id)
    const charge = picked.filter(chargeable).map((r) => r._id)
    return (
      <>
        {review.length > 0 && (
          <Button size="sm" onClick={() => openReview(review)}>
            <Users size={16} /> Review {review.length}
          </Button>
        )}
        {charge.length > 0 && (
          <Button size="sm" onClick={() => setChargeIds(charge)}>
            <ReceiptText size={16} /> Issue charges ({charge.length})
          </Button>
        )}
      </>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <PageHeader title="Intern Accommodation" subtitle={subtitle}>
        <HStack gap={2} align="end" wrap>
          {isAccountant && (
            <>
              <Field label="From">
                <Input type="date" value={exportFrom} onChange={(e) => setExportFrom(e.target.value)} />
              </Field>
              <Field label="To">
                <Input type="date" value={exportTo} onChange={(e) => setExportTo(e.target.value)} />
              </Field>
              <Button size="sm" onClick={exportInvoices} loading={exporting} disabled={exporting}>
                <Download size={14} /> Export invoices
              </Button>
            </>
          )}
          {options.canCreate && (
            <Button onClick={() => setForm({ create: true })}>
              <Plus size={16} /> New request
            </Button>
          )}
          <Button variant="ghost" onClick={refreshRequests} aria-label="Refresh">
            <RefreshCw size={16} />
          </Button>
        </HStack>
      </PageHeader>

      <div style={{ flex: 1, overflowY: "auto", padding: "var(--spacing-6) var(--spacing-8)" }}>
        <div style={{ marginBottom: "var(--spacing-5)" }}>
          <StatCards
            stats={statCards}
            columns={statCards.length}
            loading={loading || (isDesk && statsQuery.isLoading)}
            loadingCount={statCards.length}
          />
        </div>

        {(error || listQuery.error || optionsQuery.error) && (
          <div style={{ marginBottom: "var(--spacing-4)" }}>
            <Alert type="error">{error || listQuery.error?.message || optionsQuery.error?.message}</Alert>
          </div>
        )}

        <HStack gap={3} wrap align="end" style={{ marginBottom: "var(--spacing-4)" }}>
          <Field label="Search">
            <Input
              placeholder="Student, institute, faculty…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
            />
          </Field>
          <Field label="View">
            <ToggleButtonGroup
              size="md"
              shape="rounded"
              hideLabelsOnMobile={false}
              value={viewMode}
              onChange={setViewMode}
              options={[
                { value: "batches", label: "Batches" },
                { value: "individual", label: "Individual" },
              ]}
            />
          </Field>
          {renderBulk(visible)}
        </HStack>

        <div style={{ marginBottom: "var(--spacing-4)" }}>
          <Tabs variant="pills" size="md" tabs={tabs} activeTab={filter} setActiveTab={(v) => { setFilter(v); setSelectedIds([]) }} />
        </div>

        {viewMode === "batches" ? (
          <BatchTable
            groups={groups}
            loading={loading}
            selectable={!!reviewStage}
            selectedKeys={selectedKeys}
            onSelectionChange={onBatchSelectionChange}
            onOpen={(g) => setOpenBatchKey(g.key)}
          />
        ) : (
          <DataTable
            data={visible}
            columns={columns}
            isLoading={loading}
            selectable={!!reviewStage}
            selectedRows={selectedIds}
            onSelectionChange={onSelectionChange}
            getRowId={(row) => row._id}
            pagination
            pageSize={10}
            onRowClick={openDetail}
            emptyMessage="Nothing in this queue right now."
          />
        )}
      </div>

      {viewMode === "batches" && openGroup && (
        <BatchModal
          group={openGroup}
          columns={columns}
          selectable={openGroup.eligible.length > 0}
          selectedIds={selectedIds}
          onSelectionChange={onSelectionChange}
          onRowClick={openDetail}
          onClose={() => setOpenBatchKey(null)}
          actions={<HStack gap={2}>{renderBulk(openGroup.students)}</HStack>}
        />
      )}

      {requestId && !selected && detailQuery.isLoading && (
        <Modal isOpen onClose={closeDetail} title="Intern accommodation">
          <Text>Loading…</Text>
        </Modal>
      )}
      {requestId && !selected && detailQuery.error && (
        <Modal isOpen onClose={closeDetail} title="Intern accommodation">
          <Alert type="error">{detailQuery.error.message}</Alert>
        </Modal>
      )}
      {(selected || linkedRequest) && (
        <H4Detail
          key={(selected || linkedRequest)._id}
          request={selected && (!requestId || String(selected._id) === String(requestId)) ? selected : linkedRequest}
          options={options}
          onClose={closeDetail}
          onRefresh={refreshAfterAction}
          onEdit={(r) => {
            closeDetail()
            setForm({ existing: r })
          }}
        />
      )}

      {form && (
        <H4BatchForm
          key={form.existing?._id || "new"}
          options={options}
          existing={form.existing}
          onClose={() => setForm(null)}
          onSaved={async () => {
            setForm(null)
            await refreshRequests()
          }}
        />
      )}

      {chargeIds && (
        <H4ChargesModal
          ids={chargeIds}
          requests={allRequests}
          options={options}
          onClose={() => setChargeIds(null)}
          onDone={async () => {
            setSelectedIds([])
            await refreshRequests()
          }}
        />
      )}

      {reviewIds && (
        <Modal isOpen onClose={() => setReviewIds(null)} title={`Review ${reviewList.length}`} width={520}>
          <VStack gap={3}>
            {error && <Alert type="error">{error}</Alert>}
            <div style={{ maxHeight: 120, overflowY: "auto", padding: "var(--spacing-2) var(--spacing-3)", border: "1px solid var(--color-border-primary)", borderRadius: "var(--radius-md)" }}>
              {reviewList.map((r) => (
                <Text key={r._id} size="xs">{r.applicantName || "—"}</Text>
              ))}
            </div>
            <Field label="Decision">
              <Select
                value={batchAction}
                options={[
                  { value: "approve", label: reviewStage === "chief" ? "Approve" : "Recommend" },
                  { value: "request_modification", label: "Return for changes" },
                  { value: "reject", label: "Reject" },
                ]}
                onChange={(e) => setBatchAction(e.target.value)}
              />
            </Field>
            {batchAction === "approve" && reviewStage !== "chief" && (
              <Checkbox
                checked={batchConfirmed}
                onChange={(e) => setBatchConfirmed(e.target.checked)}
                label={reviewStage === "faculty" ? "Payers verified" : "Availability checked"}
              />
            )}
            <Field label={batchAction === "approve" ? "Note" : "Reason (required)"}>
              <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
            </Field>
            <Button
              loading={busy}
              disabled={
                busy ||
                !reviewList.length ||
                (batchAction !== "approve" && !reason.trim()) ||
                (batchAction === "approve" && reviewStage !== "chief" && !batchConfirmed)
              }
              onClick={applyBatch}
            >
              Apply to {reviewList.length}
            </Button>
          </VStack>
        </Modal>
      )}
    </div>
  )
}
