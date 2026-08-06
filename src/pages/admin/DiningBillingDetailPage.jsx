import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { Button, DataTable, StatusBadge } from "czero/react"
import { HStack, Modal, Page, Surface, Text } from "@/components/ui"
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
        <HStack gap={3} justify="between" wrap>
          <Text as="span" size="sm" color="muted">
            {account.name || "—"} · Allocated <Text as="strong" color="secondary">{formatCurrency(account.allocatedAmount)}</Text>
          </Text>
          <StatusBadge status={formatClearance(account.clearance)} tone={clearanceTone(account.clearance)} />
        </HStack>

        {account.perPeriod.length === 0 ? (
          <Alert type="info" icon>No charges yet — the student isn&apos;t allocated to any dining period in this billing period, or none have started.</Alert>
        ) : (
          <VStack gap={2}>
            {account.perPeriod.map((row) => (
              <Surface bg="secondary" padding={3} radius="lg" border="1px solid var(--color-border-primary)" key={row.periodId}>
                <HStack gap={2} justify="between" style={{ marginBottom: "var(--spacing-1)" }}>
                  <Text as="span" size="sm" weight="medium" color="secondary">
                    {formatDateRange(row.startDate, row.endDate)}
                  </Text>
                  <Text as="span" size="sm" weight="semibold" color="heading">
                    {formatCurrency(row.amount)}
                  </Text>
                </HStack>
                <Text as="span" size="xs" color="muted">
                  {row.chargeableDays} chargeable day{row.chargeableDays === 1 ? "" : "s"} × {formatCurrency(row.dailyRate)}
                  {" · "}{row.totalDays} elapsed − {row.rebateDays} on rebate
                </Text>
              </Surface>
            ))}
          </VStack>
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
    { key: "rollNumber", header: "Roll No", render: (row) => <Text as="span" weight="semibold" color="secondary">{row.rollNumber || "—"}</Text> },
    { key: "name", header: "Name", render: (row) => <Text as="span" color="muted">{row.name || "—"}</Text> },
    { key: "allocatedAmount", header: "Allocated", align: "right", render: (row) => formatCurrency(row.allocatedAmount) },
    { key: "totalCharged", header: "Charged", align: "right", render: (row) => formatCurrency(row.totalCharged) },
    {
      key: "balance",
      header: "Balance",
      align: "right",
      render: (row) => (
        <Text as="span" weight="semibold" color={balanceTone(row.balance) === "danger" ? "var(--color-danger)" : "var(--color-text-secondary)"}>
          {formatCurrency(row.balance)}
        </Text>
      ),
    },
    { key: "clearance", header: "Status", render: (row) => <StatusBadge status={formatClearance(row.clearance)} tone={clearanceTone(row.clearance)} /> },
  ]

  if (loading) return <LoadingState message="Loading billing period..." />

  if (notFound || !billingPeriod) {
    return (
      <Page>
        <PageHeader title="Dining Billing">
          <Button variant="secondary" onClick={() => navigate(billingBase)}>
            <ArrowLeft size={18} /> Back
          </Button>
        </PageHeader>
        <Page.Body padded={false} className="px-[var(--spacing-6)] py-[var(--spacing-6)]">
          <EmptyState icon={Wallet} title="Billing Period Not Found" message="This billing period may have been removed or archived." />
        </Page.Body>
      </Page>
    )
  }

  const rateChips = (billingPeriod.diningPeriods || []).map((period) => (
    <Surface as="span" bg="var(--color-bg-hover)" padding="var(--spacing-1) var(--spacing-2)" radius="full" color="muted" size="xs" style={{ display: "inline-flex", alignItems: "center", gap: "var(--spacing-1)" }} key={period.id}>
      {formatDateRange(period.startDate, period.endDate)} · {period.dailyRate > 0 ? `${formatCurrency(period.dailyRate)}/day` : "no rate"}
    </Surface>
  ))

  return (
    <>
      <Page>
        <PageHeader title={billingPeriod.name} subtitle={billingDateRange(billingPeriod)}>
          <Button variant="secondary" onClick={() => navigate(billingBase)}>
            <ArrowLeft size={18} /> Back
          </Button>
          <Button variant="primary" onClick={() => setShowManageFunds(true)}>
            <Upload size={18} /> Manage Funds
          </Button>
        </PageHeader>

        <Page.Body>
          {feedback && (
            <Alert type={feedback.type} icon dismissible onDismiss={() => setFeedback(null)} style={{ marginBottom: "var(--spacing-4)" }}>
              {feedback.message}
            </Alert>
          )}

          {rateChips.length > 0 && (
            <HStack gap={2} wrap style={{ marginBottom: "var(--spacing-4)" }}>
              {rateChips}
            </HStack>
          )}

          <StatCards columns={4} stats={stats} />

          <div className="mt-[var(--spacing-6)] flex items-center justify-between gap-[var(--spacing-3)] flex-wrap">
            <HStack gap={2}>
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
            </HStack>
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
        </Page.Body>
      </Page>

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
