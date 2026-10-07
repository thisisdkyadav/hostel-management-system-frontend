import { useState, useMemo } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useSearchParams } from "react-router-dom"
import { Alert, Button, Checkbox, DataTable, Field, HStack, Input, Modal, Select, StatCards, StatusBadge, Tabs, Text, Textarea, VStack, useToast } from "hzero"
import { Download, Plus, RefreshCw, Users } from "lucide-react"
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
  if (options.role === "Admin" && options.subRole === "Chief Warden")
    lanes.push(l("chief", "Chief Warden", (r) => stageFor(r) === "chief"))
  if (options.role === "Admin" && options.subRole === "Accountant")
    lanes.push(
      l(
        "payments",
        "Verify payment",
        (r) => r.payment?.status === "Submitted" || (r.additionalPayments || []).some((p) => p.status === "Submitted"),
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

const laneMatcher = (lane) => lane.match || (() => true)

const matchesSearch = (r, q) => {
  const s = q.trim().toLowerCase()
  if (!s) return true
  return [r.applicantName, r.applicantEmail, r.h4.institute, r.h4.batchLabel, r.h4.facultyName, r.h4.creatorName]
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
    queryKey: queryKeys.h4.list({ limit: 200 }),
    queryFn: () => h4Api.list({ limit: 200 }),
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
  const [batchOpen, setBatchOpen] = useState(false)
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
      { title: "Total", value: allRequests.length, subtitle: "Intern requests" },
      ...lanes
        .filter((l) => l.key !== "all" && l.key !== "mine")
        .map((l) => ({ title: l.label, value: counts[l.key] || 0, subtitle: "In queue" })),
    ],
    [lanes, counts, allRequests.length],
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

  const reviewableIds = useMemo(() => new Set(visible.filter(reviewable).map((r) => r._id)), [visible, reviewStage, user]) // eslint-disable-line react-hooks/exhaustive-deps
  const selectedReviewable = useMemo(
    () => visible.filter((r) => selectedIds.includes(r._id) && reviewableIds.has(r._id)),
    [visible, selectedIds, reviewableIds],
  )

  const onSelectionChange = (ids) => {
    setSelectedIds(ids.filter((id) => reviewableIds.has(id)))
  }

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
        requests: selectedReviewable.map((r) => ({ id: r._id, revision: r.h4.revision })),
      })
      const failed = (result.data.results || []).filter((r) => !r.success)
      const done = (result.data.results || []).length - failed.length
      toast.success(`${done} request${done === 1 ? "" : "s"} updated`)
      if (failed.length) {
        toast.error(`${failed.length} need attention`)
        setError(failed.map((r) => r.message).join(" "))
      } else {
        setBatchOpen(false)
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
              <Plus size={16} /> New batch
            </Button>
          )}
          <Button variant="ghost" onClick={refreshRequests} aria-label="Refresh">
            <RefreshCw size={16} />
          </Button>
        </HStack>
      </PageHeader>

      <div style={{ flex: 1, overflowY: "auto", padding: "var(--spacing-6) var(--spacing-8)" }}>
        <div style={{ marginBottom: "var(--spacing-5)" }}>
          <StatCards stats={statCards} columns={statCards.length} loading={loading} loadingCount={statCards.length} />
        </div>

        {(error || listQuery.error || optionsQuery.error) && (
          <div style={{ marginBottom: "var(--spacing-4)" }}>
            <Alert type="error">{error || listQuery.error?.message || optionsQuery.error?.message}</Alert>
          </div>
        )}

        <HStack gap={3} wrap align="end" style={{ marginBottom: "var(--spacing-4)" }}>
          <Field label="Search">
            <Input
              placeholder="Student, institute, batch, faculty…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
            />
          </Field>
          {selectedReviewable.length > 0 && (
            <Button
              size="sm"
              onClick={() => {
                setBatchAction("approve")
                setBatchConfirmed(false)
                setReason("")
                setBatchOpen(true)
              }}
            >
              <Users size={16} /> Review {selectedReviewable.length}
            </Button>
          )}
        </HStack>

        <div style={{ marginBottom: "var(--spacing-4)" }}>
          <Tabs variant="pills" size="md" tabs={tabs} activeTab={filter} setActiveTab={(v) => { setFilter(v); setSelectedIds([]) }} />
        </div>

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
      </div>

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

      {batchOpen && (
        <Modal isOpen onClose={() => setBatchOpen(false)} title={`Review ${selectedReviewable.length}`} width={520}>
          <VStack gap={3}>
            {error && <Alert type="error">{error}</Alert>}
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
                (batchAction !== "approve" && !reason.trim()) ||
                (batchAction === "approve" && reviewStage !== "chief" && !batchConfirmed)
              }
              onClick={applyBatch}
            >
              Apply to {selectedReviewable.length}
            </Button>
          </VStack>
        </Modal>
      )}
    </div>
  )
}
