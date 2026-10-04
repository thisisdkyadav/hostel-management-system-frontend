import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "react-router-dom"
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  DataTable,
  Field,
  HStack,
  Input,
  Modal,
  Select,
  Surface,
  Text,
  Textarea,
  VStack,
} from "hzero"
import { Download, Plus, RefreshCw, Users } from "lucide-react"
import { useAuth } from "@/contexts/AuthProvider"
import PageHeader from "@/components/common/PageHeader"
import { h4Api } from "@/service/modules/intern-accommodation.api"
import { H4Status, H4Stay } from "@/components/intern-accommodation/H4Kit"
import { money } from "@/components/intern-accommodation/h4.format"
import H4BatchForm from "@/components/intern-accommodation/H4BatchForm"
import H4Detail from "@/components/intern-accommodation/H4Detail"
import "@/components/intern-accommodation/h4.css"

const defaultQueue = (user) =>
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
            : "all"
const stageFor = (r) => r.h4.amendment?.stage || r.currentStage
const groupOptions = [
  { value: "student", label: "Student-wise" },
  { value: "batch", label: "Group by batch" },
  { value: "faculty", label: "Group by faculty" },
  { value: "creator", label: "Group by creator" },
]

export default function InternAccommodationPage() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const requestId = params.get("request")
  const [queue, setQueue] = useState(() => defaultQueue(user))
  const [group, setGroup] = useState("student")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState([])
  const [form, setForm] = useState(null)
  const [batchOpen, setBatchOpen] = useState(false)
  const [batchAction, setBatchAction] = useState("approve")
  const [batchConfirmed, setBatchConfirmed] = useState(false)
  const [reason, setReason] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [batchResults, setBatchResults] = useState([])
  const [exportFrom, setExportFrom] = useState("")
  const [exportTo, setExportTo] = useState("")
  const optionsQuery = useQuery({ queryKey: ["h4", "options"], queryFn: h4Api.options })
  const options = optionsQuery.data?.data || { faculty: [], hostels: [] }
  const filter = {
    page,
    limit: 25,
    search,
    ...(queue === "mine" ? { mine: "true" } : queue !== "all" ? { queue } : {}),
  }
  const listQuery = useQuery({ queryKey: ["h4", "requests", filter], queryFn: () => h4Api.list(filter) })
  const items = listQuery.data?.data?.items || []
  const pagination = listQuery.data?.data?.pagination
  const detail = useQuery({
    queryKey: ["h4", "request", requestId],
    queryFn: () => h4Api.get(requestId),
    enabled: !!requestId,
  })
  const office = options.role === "Admin" && options.subRole === "Chief Warden Office"
  const chief = options.role === "Admin" && options.subRole === "Chief Warden"
  const accounts = options.role === "Admin" && options.subRole === "Accountant"
  const reviewStage = office ? "office" : chief ? "chief" : options.canRecommend ? "faculty" : null
  const reviewable = (r) =>
    reviewStage &&
    stageFor(r) === reviewStage &&
    (reviewStage !== "faculty" || String(r.h4.facultyUserId) === String(user._id || user.id)) &&
    r.h4.amendment?.stage !== "office" &&
    !(r.h4.amendment?.stage === "chief" && r.rooms.length)
  const queues = [
    { value: "all", label: "All accessible requests" },
    { value: "mine", label: "My submissions" },
    ...(options.canRecommend ? [{ value: "faculty", label: "Faculty review" }] : []),
    ...(office ? [{ value: "office", label: "Office review" }] : []),
    ...(chief ? [{ value: "chief", label: "Chief Warden review" }] : []),
    ...(accounts ? [{ value: "payments", label: "Payment verification" }] : []),
    ...(options.role === "Hostel Supervisor" ? [{ value: "rooms", label: "Room assignment" }] : []),
  ]
  const open = (r) =>
    setParams((p) => {
      p.set("request", r._id)
      return p
    })
  const close = () =>
    setParams((p) => {
      p.delete("request")
      return p
    })
  const refresh = async () => {
    await listQuery.refetch()
    if (requestId) await detail.refetch()
  }
  const filterChange = () => {
    setPage(1)
    setSelected([])
    setBatchResults([])
  }
  const columns = [
    ...(reviewStage
      ? [
          {
            key: "select",
            header: (
              <div onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  aria-label="Select all reviewable students on this page"
                  checked={
                    items.filter(reviewable).length > 0 &&
                    items.filter(reviewable).every((r) => selected.some((s) => s._id === r._id))
                  }
                  onChange={(e) => setSelected(e.target.checked ? items.filter(reviewable) : [])}
                />
              </div>
            ),
            render: (r) => (
              <div onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  aria-label={`Select ${r.applicantName}`}
                  disabled={!reviewable(r)}
                  checked={selected.some((s) => s._id === r._id)}
                  onChange={(e) =>
                    setSelected((rows) => (e.target.checked ? [...rows, r] : rows.filter((s) => s._id !== r._id)))
                  }
                />
              </div>
            ),
          },
        ]
      : []),
    {
      key: "student",
      header: "Student",
      render: (r) => (
        <VStack gap={1}>
          <Text weight="semibold" size="sm">
            {r.applicantName || "Draft student"}
          </Text>
          <Text size="xs" color="muted">
            {r.h4.institute}
          </Text>
          <Text size="xs" color="muted">
            {r.applicantEmail}
          </Text>
        </VStack>
      ),
    },
    { key: "stay", header: "Stay", render: (r) => <H4Stay request={r} /> },
    {
      key: "room",
      header: "Hostel / room",
      render: (r) => (
        <VStack gap={1}>
          <Text size="sm">{r.hostelName || "Pending"}</Text>
          <Text size="xs" color="muted">
            {r.roomLabel || "Room pending"}
          </Text>
        </VStack>
      ),
    },
    {
      key: "faculty",
      header: "Faculty / creator",
      render: (r) => (
        <VStack gap={1}>
          <Text size="sm">{r.h4.facultyName}</Text>
          <Text size="xs" color="muted">
            By {r.h4.creatorName}
          </Text>
        </VStack>
      ),
    },
    { key: "batch", header: "Batch", render: (r) => <Text size="sm">{r.h4.batchLabel}</Text> },
    {
      key: "payer",
      header: "Payer",
      render: (r) => (
        <VStack gap={1}>
          <Text size="sm">{r.h4.payer.name}</Text>
          <Text size="xs" color="muted">
            {r.h4.payer.type === "faculty" ? "Faculty" : "Intern / student"}
          </Text>
        </VStack>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (r) => money((r.payment?.amount || 0) + (r.additionalPayments || []).reduce((s, p) => s + p.amount, 0)),
    },
    { key: "status", header: "Status", render: (r) => <H4Status request={r} /> },
  ]
  const groups = new Map()
  if (group !== "student")
    for (const r of items) {
      const key = group === "batch" ? r.h4.batchId : group === "faculty" ? r.h4.facultyUserId : r.requesterUserId
      const title = group === "batch" ? r.h4.batchLabel : group === "faculty" ? r.h4.facultyName : r.h4.creatorName
      if (!groups.has(String(key))) groups.set(String(key), { title, rows: [] })
      groups.get(String(key)).rows.push(r)
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
        requests: selected.map((r) => ({ id: r._id, revision: r.h4.revision })),
      })
      setBatchResults(
        result.data.results.map((r) => ({ ...r, name: selected.find((s) => s._id === r.id)?.applicantName || r.id })),
      )
      setBatchOpen(false)
      setSelected([])
      await refresh()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  const exportInvoices = async () => {
    setBusy(true)
    setError("")
    try {
      const blob = await h4Api.export({ from: exportFrom, to: exportTo })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `h4-invoices-${exportFrom}-${exportTo}.xls`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  const table = (rows) => (
    <DataTable
      data={rows}
      columns={columns}
      loading={listQuery.isLoading}
      onRowClick={open}
      emptyMessage="No H4 requests in this view."
    />
  )
  return (
    <div className="h4-page">
      <PageHeader title="Intern & Student Accommodation" subtitle="H4 · Interns and unregistered students">
        <HStack gap={2}>
          {options.canCreate && (
            <Button onClick={() => setForm({ create: true })}>
              <Plus size={16} /> New batch
            </Button>
          )}
          <Button variant="ghost" onClick={refresh} aria-label="Refresh requests">
            <RefreshCw size={16} />
          </Button>
        </HStack>
      </PageHeader>
      <div className="h4-page-content">
        <VStack gap={4}>
          {(error || listQuery.error || optionsQuery.error) && (
            <Alert tone="danger">{error || listQuery.error?.message || optionsQuery.error?.message}</Alert>
          )}
          <div className="h4-toolbar">
            <Field label="Find student, batch or faculty">
              <Input
                placeholder="Search requests…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  filterChange()
                }}
              />
            </Field>
            <Field label="View">
              <Select
                value={queue}
                options={queues}
                onChange={(e) => {
                  setQueue(e.target.value)
                  filterChange()
                }}
              />
            </Field>
            <Field label="Rows">
              <Select value={group} options={groupOptions} onChange={(e) => setGroup(e.target.value)} />
            </Field>
          </div>
          <HStack justify="between" gap={2} wrap>
            <Text size="sm" color="muted">
              {pagination?.total || 0} request{pagination?.total === 1 ? "" : "s"}
              {group !== "student" ? " · Groups shown for this page" : " · One row per student"}
            </Text>
            {selected.length > 0 && (
              <Button
                size="sm"
                onClick={() => {
                  setBatchAction("approve")
                  setBatchConfirmed(false)
                  setReason("")
                  setBatchOpen(true)
                }}
              >
                <Users size={16} /> Review {selected.length} selected
              </Button>
            )}
          </HStack>
          {batchResults.length > 0 && (
            <Surface bg="secondary" padding={3} radius="md">
              <VStack gap={2}>
                <Text size="sm" weight="semibold">
                  {batchResults.filter((r) => r.success).length} saved · {batchResults.filter((r) => !r.success).length}{" "}
                  need attention
                </Text>
                {batchResults
                  .filter((r) => !r.success)
                  .map((r) => (
                    <Text key={r.id} size="sm" color="danger">
                      {r.name}: {r.message}
                    </Text>
                  ))}
                <Button size="sm" variant="ghost" onClick={() => setBatchResults([])}>
                  Dismiss
                </Button>
              </VStack>
            </Surface>
          )}
          {group === "student" || items.length === 0
            ? table(items)
            : [...groups.entries()].map(([key, value]) => (
                <VStack key={key} gap={2}>
                  <HStack gap={2}>
                    <Text weight="semibold">{value.title}</Text>
                    <Badge>{value.rows.length}</Badge>
                  </HStack>
                  {table(value.rows)}
                </VStack>
              ))}
          <HStack justify="between" gap={2} wrap>
            <Text size="xs" color="muted">
              Page {page} of {Math.max(1, pagination?.totalPages || 1)}
            </Text>
            <HStack gap={2}>
              <Button
                size="sm"
                variant="secondary"
                disabled={page <= 1 || listQuery.isFetching}
                onClick={() => {
                  setPage((p) => p - 1)
                  setSelected([])
                }}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={!pagination?.hasMore || listQuery.isFetching}
                onClick={() => {
                  setPage((p) => p + 1)
                  setSelected([])
                }}
              >
                Next
              </Button>
            </HStack>
          </HStack>
          {accounts && (
            <Surface bg="secondary" padding={3} radius="md">
              <HStack align="end" gap={3} wrap>
                <Field label="Invoice date from">
                  <Input type="date" value={exportFrom} onChange={(e) => setExportFrom(e.target.value)} />
                </Field>
                <Field label="Invoice date to">
                  <Input type="date" value={exportTo} onChange={(e) => setExportTo(e.target.value)} />
                </Field>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={busy || !exportFrom || !exportTo}
                  onClick={exportInvoices}
                >
                  <Download size={16} /> Export H4 invoices
                </Button>
              </HStack>
            </Surface>
          )}
        </VStack>
      </div>
      {requestId && detail.isLoading && (
        <Modal isOpen onClose={close} title="H4 request">
          <Text>Loading request…</Text>
        </Modal>
      )}
      {requestId && detail.error && (
        <Modal isOpen onClose={close} title="H4 request">
          <Alert tone="danger">{detail.error.message}</Alert>
        </Modal>
      )}
      {requestId && detail.data?.data && (
        <H4Detail
          key={requestId}
          request={detail.data.data}
          options={options}
          onClose={close}
          onRefresh={refresh}
          onEdit={(r) => {
            close()
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
            await refresh()
          }}
        />
      )}
      {batchOpen && (
        <Modal isOpen onClose={() => setBatchOpen(false)} title={`Review ${selected.length} students`} width={520}>
          <VStack gap={3}>
            {error && <Alert tone="danger">{error}</Alert>}
            <Text size="sm">Each request is processed separately. Any failures stay visible.</Text>
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
                label={
                  reviewStage === "faculty"
                    ? "I recommend all selected stays and have verified each payer"
                    : "I have checked accommodation availability for every selected student"
                }
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
              Apply to {selected.length} students
            </Button>
          </VStack>
        </Modal>
      )}
    </div>
  )
}
