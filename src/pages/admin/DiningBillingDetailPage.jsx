import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { Button, DataTable, Modal, StatusBadge } from "czero/react"
import { ArrowLeft, Upload, Users, Wallet } from "lucide-react"
import PageHeader from "../../components/common/PageHeader"
import { adminApi } from "../../service"
import { Alert, EmptyState, LoadingState, SearchInput, StatCards, VStack } from "@/components/ui"
import ManageFundsModal from "@/components/dining/ManageFundsModal"
import {
  balanceTone,
  billingDateRange,
  clearanceTone,
  formatClearance,
  formatCurrency,
  formatDateRange,
} from "@/components/dining/diningBillingHelpers"

const CLEARANCE_FILTERS = [
  { id: "all", label: "All" },
  { id: "cleared", label: "Cleared" },
  { id: "dues", label: "Dues" },
]

const emptySummary = { totalAllocated: 0, totalCharged: 0, totalBalance: 0, studentCount: 0, duesCount: 0 }

const BreakdownModal = ({ account, onClose }) => {
  if (!account) return null
  return (
    <Modal isOpen={Boolean(account)} onClose={onClose} title={`${account.rollNumber || "Student"} — charge breakdown`} width={620}>
      <VStack gap="large">
        <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--spacing-3)", flexWrap: "wrap" }}>
          <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
            {account.name || "—"} · Allocated <strong style={{ color: "var(--color-text-secondary)" }}>{formatCurrency(account.allocatedAmount)}</strong>
          </span>
          <StatusBadge status={formatClearance(account.clearance)} tone={clearanceTone(account.clearance)} />
        </div>

        {account.perPeriod.length === 0 ? (
          <Alert type="info" icon>No charges yet — the student isn&apos;t allocated to any dining period in this billing period, or none have started.</Alert>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
            {account.perPeriod.map((row) => (
              <div
                key={row.periodId}
                style={{ border: "1px solid var(--color-border-primary)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-3)", backgroundColor: "var(--color-bg-secondary)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--spacing-2)", marginBottom: "var(--spacing-1)" }}>
                  <span style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)" }}>
                    {formatDateRange(row.startDate, row.endDate)}
                  </span>
                  <span style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-heading)" }}>
                    {formatCurrency(row.amount)}
                  </span>
                </div>
                <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                  {row.chargeableDays} chargeable day{row.chargeableDays === 1 ? "" : "s"} × {formatCurrency(row.dailyRate)}
                  {" · "}{row.totalDays} elapsed − {row.rebateDays} on rebate
                </span>
              </div>
            ))}
          </div>
        )}
      </VStack>
    </Modal>
  )
}

const DiningBillingDetailPage = () => {
  const { billingPeriodId } = useParams()
  const navigate = useNavigate()
  // Same component renders under /admin and /dining-office; keep links in-portal.
  const billingBase = useLocation().pathname.startsWith("/dining-office") ? "/dining-office/dining-billing" : "/admin/dining-billing"

  const [billingPeriod, setBillingPeriod] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [clearanceFilter, setClearanceFilter] = useState("all")
  const [showManageFunds, setShowManageFunds] = useState(false)
  const [breakdownAccount, setBreakdownAccount] = useState(null)

  const fetchAccounts = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true)
    try {
      const response = await adminApi.getBillingAccounts(billingPeriodId)
      setBillingPeriod(response?.billingPeriod || null)
      setAccounts(Array.isArray(response?.accounts) ? response.accounts : [])
      setNotFound(false)
    } catch (error) {
      console.error("Error fetching billing accounts:", error)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billingPeriodId])

  const filtered = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()
    return accounts.filter((account) => {
      if (clearanceFilter !== "all" && account.clearance !== clearanceFilter) return false
      if (!search) return true
      return (
        String(account.rollNumber || "").toLowerCase().includes(search) ||
        String(account.name || "").toLowerCase().includes(search)
      )
    })
  }, [accounts, searchTerm, clearanceFilter])

  const summary = billingPeriod?.summary ? { ...emptySummary, ...billingPeriod.summary } : emptySummary

  const handleManageFunds = async (mode, entries) => {
    const result = await adminApi.bulkUpdateBillingAccounts(billingPeriodId, { mode, entries })
    setFeedback({ type: "success", message: result?.message || "Funds updated." })
    await fetchAccounts({ silent: true })
    return result
  }

  const stats = [
    { title: "Allocated", value: formatCurrency(summary.totalAllocated), subtitle: "Total credit", icon: <Wallet size={20} />, color: "var(--color-primary)" },
    { title: "Charged", value: formatCurrency(summary.totalCharged), subtitle: "Derived to date", icon: <Wallet size={20} />, color: "var(--color-warning)" },
    { title: "Balance", value: formatCurrency(summary.totalBalance), subtitle: "Allocated − charged", icon: <Wallet size={20} />, color: "var(--color-success)" },
    { title: "Students", value: summary.studentCount, subtitle: `${summary.duesCount} in dues`, icon: <Users size={20} />, color: "var(--color-danger)" },
  ]

  const columns = [
    { key: "rollNumber", header: "Roll No", render: (row) => <span style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-secondary)" }}>{row.rollNumber || "—"}</span> },
    { key: "name", header: "Name", render: (row) => <span style={{ color: "var(--color-text-muted)" }}>{row.name || "—"}</span> },
    { key: "allocatedAmount", header: "Allocated", align: "right", render: (row) => formatCurrency(row.allocatedAmount) },
    { key: "totalCharged", header: "Charged", align: "right", render: (row) => formatCurrency(row.totalCharged) },
    {
      key: "balance",
      header: "Balance",
      align: "right",
      render: (row) => (
        <span style={{ fontWeight: "var(--font-weight-semibold)", color: balanceTone(row.balance) === "danger" ? "var(--color-danger)" : "var(--color-text-secondary)" }}>
          {formatCurrency(row.balance)}
        </span>
      ),
    },
    { key: "clearance", header: "Status", render: (row) => <StatusBadge status={formatClearance(row.clearance)} tone={clearanceTone(row.clearance)} /> },
  ]

  if (loading) return <LoadingState message="Loading billing period..." />

  if (notFound || !billingPeriod) {
    return (
      <div className="flex flex-col h-full">
        <PageHeader title="Dining Billing">
          <Button variant="secondary" onClick={() => navigate(billingBase)}>
            <ArrowLeft size={18} /> Back
          </Button>
        </PageHeader>
        <div className="flex-1 overflow-y-auto px-[var(--spacing-6)] py-[var(--spacing-6)]">
          <EmptyState icon={Wallet} title="Billing Period Not Found" message="This billing period may have been removed or archived." />
        </div>
      </div>
    )
  }

  const rateChips = (billingPeriod.diningPeriods || []).map((period) => (
    <span
      key={period.id}
      style={{ display: "inline-flex", alignItems: "center", gap: "var(--spacing-1)", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", backgroundColor: "var(--color-bg-hover)", borderRadius: "var(--radius-full)", padding: "var(--spacing-1) var(--spacing-2)" }}
    >
      {formatDateRange(period.startDate, period.endDate)} · {period.dailyRate > 0 ? `${formatCurrency(period.dailyRate)}/day` : "no rate"}
    </span>
  ))

  return (
    <>
      <div className="flex flex-col h-full">
        <PageHeader title={billingPeriod.name} subtitle={billingDateRange(billingPeriod)}>
          <Button variant="secondary" onClick={() => navigate(billingBase)}>
            <ArrowLeft size={18} /> Back
          </Button>
          <Button variant="primary" onClick={() => setShowManageFunds(true)}>
            <Upload size={18} /> Manage Funds
          </Button>
        </PageHeader>

        <div className="flex-1 overflow-y-auto px-[var(--spacing-4)] md:px-[var(--spacing-6)] lg:px-[var(--spacing-8)] py-[var(--spacing-6)]">
          {feedback && (
            <Alert type={feedback.type} icon dismissible onDismiss={() => setFeedback(null)} style={{ marginBottom: "var(--spacing-4)" }}>
              {feedback.message}
            </Alert>
          )}

          {rateChips.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-2)", marginBottom: "var(--spacing-4)" }}>
              {rateChips}
            </div>
          )}

          <StatCards columns={4} stats={stats} />

          <div className="mt-[var(--spacing-6)] flex items-center justify-between gap-[var(--spacing-3)] flex-wrap">
            <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
              {CLEARANCE_FILTERS.map((filter) => (
                <Button
                  key={filter.id}
                  variant={clearanceFilter === filter.id ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setClearanceFilter(filter.id)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
            <div className="w-full sm:w-[18rem]">
              <SearchInput value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search roll / name..." />
            </div>
          </div>

          <div className="mt-[var(--spacing-4)]">
            {filtered.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No Students Found"
                message="No students match this filter. Allocate students to the dining periods or upload fund allocations."
              />
            ) : (
              <DataTable
                data={filtered}
                columns={columns}
                getRowId={(row) => row.studentUserId}
                onRowClick={setBreakdownAccount}
                pagination
                pageSize={15}
              />
            )}
          </div>
        </div>
      </div>

      {showManageFunds && (
        <ManageFundsModal
          isOpen
          onClose={() => setShowManageFunds(false)}
          onSubmit={handleManageFunds}
        />
      )}

      <BreakdownModal account={breakdownAccount} onClose={() => setBreakdownAccount(null)} />
    </>
  )
}

export default DiningBillingDetailPage
