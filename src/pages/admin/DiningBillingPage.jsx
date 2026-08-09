import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Alert, Button, ConfirmDialog, EmptyState, Grid, Heading, HStack, Page, SearchInput, StatCards, Text } from "hzero"
import { Archive, ArchiveRestore, ArrowRight, Pencil, Plus, Users, Wallet } from "lucide-react"
import PageHeader from "../../components/common/PageHeader"
import { adminApi } from "../../service"
import CapacityBar from "@/components/dining/CapacityBar"
import BillingPeriodFormModal from "@/components/dining/BillingPeriodFormModal"
import { billingDateRange, formatCurrency, getErrorMessage } from "@/components/dining/diningBillingHelpers"

const emptySummary = { totalAllocated: 0, totalCharged: 0, totalBalance: 0, studentCount: 0, duesCount: 0 }

const normalizeBillingPeriod = (period = {}) => ({
  id: period.id || period._id,
  name: period.name || "Untitled",
  note: period.note || "",
  isArchived: Boolean(period.isArchived),
  diningPeriodIds: Array.isArray(period.diningPeriodIds) ? period.diningPeriodIds : [],
  diningPeriods: Array.isArray(period.diningPeriods) ? period.diningPeriods : [],
  startDate: period.startDate || null,
  endDate: period.endDate || null,
  summary: { ...emptySummary, ...(period.summary || {}) },
})

const BillingPeriodCard = ({ billingPeriod, onOpen, onEdit, onArchive }) => {
  const { summary } = billingPeriod
  const periodCount = billingPeriod.diningPeriods.length

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(billingPeriod)}
      onKeyDown={(event) => { if (event.key === "Enter") onOpen(billingPeriod) }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-3)",
        padding: "var(--spacing-4)",
        border: "1px solid var(--color-border-primary)",
        borderRadius: "var(--radius-card)",
        backgroundColor: "var(--color-bg-primary)",
        cursor: "pointer",
      }}
    >
      <HStack gap={2} justify="between">
        <div style={{ minWidth: 0 }}>
          <Heading as="h3" size="md" weight="bold" color="heading" style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {billingPeriod.name}
          </Heading>
          <Text size="xs" color="muted" style={{ margin: "var(--spacing-1) 0 0" }}>
            {billingDateRange(billingPeriod)} · {periodCount} period{periodCount === 1 ? "" : "s"}
          </Text>
        </div>
        <div style={{ display: "flex", gap: "var(--spacing-1)", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => onEdit(billingPeriod)} title="Edit">
            <Pencil size={15} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onArchive(billingPeriod)} title={billingPeriod.isArchived ? "Unarchive" : "Archive"}>
            {billingPeriod.isArchived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
          </Button>
        </div>
      </HStack>

      <HStack justify="between" gap={3} size="sm">
        <Text as="span" color="muted">Allocated <Text as="strong" color="secondary">{formatCurrency(summary.totalAllocated)}</Text></Text>
        <Text as="span" color="muted">Charged <Text as="strong" color="secondary">{formatCurrency(summary.totalCharged)}</Text></Text>
      </HStack>

      <CapacityBar allocated={summary.totalCharged} total={summary.totalAllocated} showLabel={false} size="sm" />

      <HStack gap={2} align="center" justify="between">
        <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--spacing-1)", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
          <Users size={13} /> {summary.studentCount} student{summary.studentCount === 1 ? "" : "s"}
          {summary.duesCount > 0 && (
            <Text as="span" color="danger" weight="semibold">· {summary.duesCount} in dues</Text>
          )}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--spacing-1)", fontSize: "var(--font-size-xs)", color: "var(--color-primary)", fontWeight: "var(--font-weight-semibold)" }}>
          Open <ArrowRight size={13} />
        </span>
      </HStack>
    </div>
  )
}

const DiningBillingPage = () => {
  const navigate = useNavigate()
  // Same component renders under /admin and /dining-office; keep links in-portal.
  const billingBase = useLocation().pathname.startsWith("/dining-office") ? "/dining-office/dining-billing" : "/admin/dining-billing"
  const [billingPeriods, setBillingPeriods] = useState([])
  const [diningPeriods, setDiningPeriods] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [fetchArchive, setFetchArchive] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPeriod, setEditingPeriod] = useState(null)
  const [archiveTarget, setArchiveTarget] = useState(null)

  const filtered = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()
    if (!search) return billingPeriods
    return billingPeriods.filter((period) => period.name.toLowerCase().includes(search))
  }, [billingPeriods, searchTerm])

  const fetchBillingPeriods = async (archive = fetchArchive) => {
    try {
      const response = await adminApi.getBillingPeriods(archive ? "archive=true" : "")
      setBillingPeriods(Array.isArray(response) ? response.map(normalizeBillingPeriod) : [])
    } catch (error) {
      console.error("Error fetching billing periods:", error)
      setBillingPeriods([])
    }
  }

  const fetchDiningPeriods = async () => {
    try {
      const response = await adminApi.getAllDiningPeriods("")
      setDiningPeriods(
        Array.isArray(response)
          ? response.map((period) => ({
              id: String(period.id || period._id),
              startDate: period.startDate,
              endDate: period.endDate,
              dailyRate: Math.max(0, Number(period.dailyRate || 0)),
              status: period.status || "",
            }))
          : []
      )
    } catch (error) {
      console.error("Error fetching dining periods:", error)
      setDiningPeriods([])
    }
  }

  useEffect(() => {
    fetchBillingPeriods(false)
    fetchDiningPeriods()
  }, [])

  const handleArchiveToggle = () => {
    const next = !fetchArchive
    setFetchArchive(next)
    fetchBillingPeriods(next)
  }

  const handleAdd = async (payload) => {
    await adminApi.addBillingPeriod(payload)
    setFeedback({ type: "success", message: "Billing period created." })
    await fetchBillingPeriods()
  }

  const handleUpdate = async (payload) => {
    if (!editingPeriod?.id) return
    await adminApi.updateBillingPeriod(editingPeriod.id, payload)
    setEditingPeriod(null)
    setFeedback({ type: "success", message: "Billing period updated." })
    await fetchBillingPeriods()
  }

  const handleConfirmArchive = async () => {
    if (!archiveTarget?.id) return
    const action = archiveTarget.isArchived ? "unarchive" : "archive"
    try {
      await adminApi.changeBillingPeriodArchiveStatus(archiveTarget.id, !archiveTarget.isArchived)
      setArchiveTarget(null)
      setEditingPeriod(null)
      setFeedback({ type: "success", message: `Billing period ${action}d.` })
      await fetchBillingPeriods()
    } catch (error) {
      setArchiveTarget(null)
      setFeedback({ type: "error", message: getErrorMessage(error, `Unable to ${action} billing period.`) })
    }
  }

  const stats = useMemo(() => {
    const totals = billingPeriods.reduce(
      (acc, period) => {
        acc.allocated += period.summary.totalAllocated
        acc.charged += period.summary.totalCharged
        acc.students += period.summary.studentCount
        acc.dues += period.summary.duesCount
        return acc
      },
      { allocated: 0, charged: 0, students: 0, dues: 0 }
    )
    return [
      { title: "Total Allocated", value: formatCurrency(totals.allocated), subtitle: "Across billing periods", icon: <Wallet size={20} />, color: "var(--color-primary)" },
      { title: "Total Charged", value: formatCurrency(totals.charged), subtitle: "Derived to date", icon: <Wallet size={20} />, color: "var(--color-warning)" },
      { title: "Outstanding", value: formatCurrency(totals.allocated - totals.charged), subtitle: "Allocated − charged", icon: <Wallet size={20} />, color: "var(--color-success)" },
      { title: "Students in Dues", value: totals.dues, subtitle: "Negative balance", icon: <Users size={20} />, color: "var(--color-danger)" },
    ]
  }, [billingPeriods])

  return (
    <>
      <Page>
        <PageHeader title="Dining Billing">
          <Button variant="secondary" onClick={handleArchiveToggle}>
            {fetchArchive ? <ArchiveRestore size={18} /> : <Archive size={18} />}
            {fetchArchive ? "Show Active" : "Show Archived"}
          </Button>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> New Billing Period
          </Button>
        </PageHeader>

        <Page.Body>
          {feedback && (
            <Alert type={feedback.type} icon dismissible onDismiss={() => setFeedback(null)} style={{ marginBottom: "var(--spacing-4)" }}>
              {feedback.message}
            </Alert>
          )}

          <StatCards columns={4} stats={stats} />

          <div className="mt-[var(--spacing-6)] flex justify-end">
            <div className="w-full sm:w-[18rem]">
              <SearchInput value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search billing periods..." />
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="No Billing Periods Found"
              message={fetchArchive ? "No archived billing periods match your search." : "Create a billing period and group dining periods to start billing students."}
            />
          ) : (
            <Grid cols={{ sm: 2, xl: 3 }} gap={4} className="mt-[var(--spacing-6)]">
              {filtered.map((period) => (
                <BillingPeriodCard
                  key={period.id}
                  billingPeriod={period}
                  onOpen={(bp) => navigate(`${billingBase}/${bp.id}`)}
                  onEdit={setEditingPeriod}
                  onArchive={setArchiveTarget}
                />
              ))}
            </Grid>
          )}
        </Page.Body>
      </Page>

      {showAddModal && (
        <BillingPeriodFormModal
          isOpen
          title="New Billing Period"
          submitLabel="Create"
          periods={diningPeriods}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAdd}
        />
      )}

      {editingPeriod && (
        <BillingPeriodFormModal
          key={editingPeriod.id}
          isOpen
          title="Edit Billing Period"
          submitLabel="Save Changes"
          initialData={editingPeriod}
          periods={diningPeriods}
          onClose={() => setEditingPeriod(null)}
          onSubmit={handleUpdate}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(archiveTarget)}
        onClose={() => setArchiveTarget(null)}
        onConfirm={handleConfirmArchive}
        title={archiveTarget?.isArchived ? "Unarchive Billing Period" : "Archive Billing Period"}
        message={
          archiveTarget?.isArchived
            ? "This billing period will be visible to admins and students again."
            : "Archiving hides this billing period from admins and students. Allocations and history are kept."
        }
        confirmText={archiveTarget?.isArchived ? "Unarchive" : "Archive"}
        isDestructive={!archiveTarget?.isArchived}
      />
    </>
  )
}

export default DiningBillingPage
