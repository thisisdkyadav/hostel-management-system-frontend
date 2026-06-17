import { useEffect, useState } from "react"
import { Button, StatusBadge, DataTable } from "czero/react"
import { CheckCircle2, Clock, RefreshCw, UtensilsCrossed, Users, Wallet, ClipboardCheck } from "lucide-react"
import { Alert, Card, EmptyState, LoadingState, StatCards, VStack } from "@/components/ui"
import PageHeader from "../../components/common/PageHeader"
import CapacityBar from "@/components/dining/CapacityBar"
import { formatCurrency } from "@/components/dining/diningBillingHelpers"
import { diningOfficeApi } from "../../service"
import { useAuth } from "@/contexts/AuthProvider"

const getErrorMessage = (error, fallback) => error?.response?.data?.message || error?.message || fallback

const formatDate = (value) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short" })
}

const formatPeriodRange = (period) => {
  if (!period) return "No active dining period"
  return `${formatDate(period.startDate)} – ${formatDate(period.endDate)}`
}

const emptyDashboard = {
  activePeriod: null,
  caterers: { total: 0, breakdown: [] },
  today: { allocated: 0, verified: 0, pending: 0, onRebate: 0, mealSlot: null },
  rebates: { pending: 0, approvedToday: 0, upcoming: 0 },
  billing: { totalAllocated: 0, totalCharged: 0, totalOutstanding: 0, studentCount: 0, duesCount: 0, periodCount: 0 },
}

const DashboardPage = () => {
  const { user } = useAuth()
  const [data, setData] = useState(emptyDashboard)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")

  const fetchDashboard = async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true)
    else setLoading(true)
    try {
      const response = await diningOfficeApi.getDashboard()
      setData({ ...emptyDashboard, ...(response || {}) })
      setError("")
    } catch (fetchError) {
      setError(getErrorMessage(fetchError, "Unable to load dashboard."))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const { activePeriod, caterers, today, rebates, billing } = data
  const hasActiveMeal = Boolean(today.mealSlot)

  const todayStats = [
    { title: "Allocated", value: today.allocated, subtitle: "Students in period", icon: <Users size={20} />, color: "var(--color-primary)" },
    { title: "Verified Today", value: today.verified, subtitle: "Meals confirmed", icon: <CheckCircle2 size={20} />, color: "var(--color-success)" },
    { title: "Pending", value: today.pending, subtitle: "Not yet scanned", icon: <Clock size={20} />, color: "var(--color-warning)" },
    { title: "On Rebate", value: today.onRebate, subtitle: "Excused today", icon: <UtensilsCrossed size={20} />, color: "var(--color-text-muted)" },
  ]

  const billingStats = [
    { title: "Allocated", value: formatCurrency(billing.totalAllocated), subtitle: "Total credit", icon: <Wallet size={20} />, color: "var(--color-primary)" },
    { title: "Charged", value: formatCurrency(billing.totalCharged), subtitle: "Derived to date", icon: <Wallet size={20} />, color: "var(--color-warning)" },
    { title: "Outstanding", value: formatCurrency(billing.totalOutstanding), subtitle: "Allocated − charged", icon: <Wallet size={20} />, color: "var(--color-success)" },
    { title: "In Dues", value: billing.duesCount, subtitle: `${billing.studentCount} students · ${billing.periodCount} periods`, icon: <Users size={20} />, color: "var(--color-danger)" },
  ]

  const catererColumns = [
    { key: "name", header: "Caterer", render: (row) => <span style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-secondary)" }}>{row.name || "—"}</span> },
    { key: "allocatedCount", header: "Allocated", align: "right", render: (row) => row.allocatedCount },
    { key: "maxStudentCount", header: "Capacity", align: "right", render: (row) => row.maxStudentCount || "—" },
    {
      key: "utilization",
      header: "Utilization",
      render: (row) => (
        <div style={{ minWidth: 140 }}>
          <CapacityBar allocated={row.allocatedCount} total={row.maxStudentCount} />
        </div>
      ),
    },
  ]

  if (loading) {
    return <LoadingState message="Loading dashboard..." />
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Dining Office" subtitle={`Welcome back, ${user?.name || "Office"}`}>
        <Button variant="secondary" onClick={() => fetchDashboard({ silent: true })} disabled={refreshing}>
          <RefreshCw size={18} /> {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </PageHeader>

      <div className="flex-1 overflow-y-auto px-[var(--spacing-4)] md:px-[var(--spacing-6)] lg:px-[var(--spacing-8)] py-[var(--spacing-6)]">
        <VStack gap="large">
          {error && <Alert type="error" icon dismissible onDismiss={() => setError("")}>{error}</Alert>}

          {/* Current period / meal hero */}
          <Card>
            <div className="flex flex-col lg:flex-row lg:items-center gap-[var(--spacing-5)]">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)" }}>
                  <div className="flex items-center justify-center" style={{ width: 48, height: 48, borderRadius: "var(--radius-xl)", backgroundColor: "var(--color-primary-bg)", color: "var(--color-primary)", flexShrink: 0 }}>
                    <UtensilsCrossed size={24} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
                      <h2 style={{ margin: 0, fontSize: "var(--font-size-xl)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-heading)" }}>
                        {hasActiveMeal ? today.mealSlot : "No active meal"}
                      </h2>
                      <StatusBadge status={activePeriod ? "Active period" : "No active period"} tone={activePeriod ? "success" : "primary"} showDot={Boolean(activePeriod)} />
                    </div>
                    <p style={{ margin: "var(--spacing-1) 0 0", color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                      {formatPeriodRange(activePeriod)}
                    </p>
                    {activePeriod && (
                      <p style={{ margin: "var(--spacing-1) 0 0", color: "var(--color-text-muted)", fontSize: "var(--font-size-xs)" }}>
                        {activePeriod.dailyRate > 0 ? `${formatCurrency(activePeriod.dailyRate)}/day` : "No daily rate set"} · {caterers.total} caterer{caterers.total === 1 ? "" : "s"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-[300px] lg:flex-shrink-0">
                <CapacityBar allocated={today.verified} total={today.allocated} label="Verified today" />
              </div>
            </div>
          </Card>

          {/* Today's meal service */}
          <div>
            <h3 style={{ margin: "0 0 var(--spacing-3)", fontSize: "var(--font-size-md)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-heading)" }}>Today&apos;s Meal Service</h3>
            <StatCards columns={4} stats={todayStats} />
          </div>

          {/* Caterer utilization */}
          <Card style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "var(--font-size-md)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-heading)" }}>Caterer Utilization</h3>
              <p style={{ margin: "var(--spacing-1) 0 0", color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                Allocation against capacity for the active dining period.
              </p>
            </div>
            {caterers.breakdown.length === 0 ? (
              <EmptyState icon={UtensilsCrossed} title="No Caterers" message="No caterers are configured for the active period yet." />
            ) : (
              <DataTable data={caterers.breakdown} columns={catererColumns} getRowId={(row) => row.id} />
            )}
          </Card>

          {/* Rebates */}
          <Card style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
              <ClipboardCheck size={18} style={{ color: "var(--color-text-muted)" }} />
              <h3 style={{ margin: 0, fontSize: "var(--font-size-md)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-heading)" }}>Rebates</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-[var(--spacing-3)]">
              {[
                { label: "Pending approval", value: rebates.pending, tone: "var(--color-warning)" },
                { label: "Approved today", value: rebates.approvedToday, tone: "var(--color-success)" },
                { label: "Upcoming approved", value: rebates.upcoming, tone: "var(--color-primary)" },
              ].map((item) => (
                <div key={item.label} className="rounded-[var(--radius-lg)] border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-[var(--spacing-4)]">
                  <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>{item.label}</p>
                  <p style={{ color: item.tone, fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-2xl)" }}>{item.value}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Billing health */}
          <div>
            <h3 style={{ margin: "0 0 var(--spacing-3)", fontSize: "var(--font-size-md)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-heading)" }}>Billing Health</h3>
            <StatCards columns={4} stats={billingStats} />
          </div>
        </VStack>
      </div>
    </div>
  )
}

export default DashboardPage
