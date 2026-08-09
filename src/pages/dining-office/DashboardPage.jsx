import { useEffect, useState } from "react"
import { Alert, Button, Card, DataTable, EmptyState, Grid, Heading, HStack, LoadingState, Page, StatCards, StatusBadge, Text, VStack } from "hzero"
import { CheckCircle2, Clock, RefreshCw, UtensilsCrossed, Users, Wallet, ClipboardCheck } from "lucide-react"
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
    { key: "name", header: "Caterer", render: (row) => <Text as="span" weight="semibold" color="secondary">{row.name || "—"}</Text> },
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
    <Page>
      <PageHeader title="Dining Office" subtitle={`Welcome back, ${user?.name || "Office"}`}>
        <Button variant="secondary" onClick={() => fetchDashboard({ silent: true })} disabled={refreshing}>
          <RefreshCw size={18} /> {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </PageHeader>

      <Page.Body>
        <VStack gap="large">
          {error && <Alert type="error" icon dismissible onDismiss={() => setError("")}>{error}</Alert>}

          {/* Current period / meal hero */}
          <Card>
            <div className="flex flex-col lg:flex-row lg:items-center gap-[var(--spacing-5)]">
              <div style={{ flex: 1, minWidth: 0 }}>
                <HStack gap={3} align="center">
                  <Text as="div" color="brand" style={{ width: 48, height: 48, borderRadius: "var(--radius-xl)", backgroundColor: "var(--color-primary-bg)", flexShrink: 0 }} className="flex items-center justify-center">
                    <UtensilsCrossed size={24} />
                  </Text>
                  <div style={{ minWidth: 0 }}>
                    <HStack gap={2} align="center" wrap>
                      <Heading as="h2" size="xl" weight="bold" color="heading" style={{ margin: 0 }}>
                        {hasActiveMeal ? today.mealSlot : "No active meal"}
                      </Heading>
                      <StatusBadge status={activePeriod ? "Active period" : "No active period"} tone={activePeriod ? "success" : "primary"} showDot={Boolean(activePeriod)} />
                    </HStack>
                    <Text color="muted" size="sm" style={{ margin: "var(--spacing-1) 0 0" }}>
                      {formatPeriodRange(activePeriod)}
                    </Text>
                    {activePeriod && (
                      <Text color="muted" size="xs" style={{ margin: "var(--spacing-1) 0 0" }}>
                        {activePeriod.dailyRate > 0 ? `${formatCurrency(activePeriod.dailyRate)}/day` : "No daily rate set"} · {caterers.total} caterer{caterers.total === 1 ? "" : "s"}
                      </Text>
                    )}
                  </div>
                </HStack>
              </div>
              <div className="w-full lg:w-[300px] lg:flex-shrink-0">
                <CapacityBar allocated={today.verified} total={today.allocated} label="Verified today" />
              </div>
            </div>
          </Card>

          {/* Today's meal service */}
          <div>
            <Heading as="h3" size="md" weight="bold" color="heading" style={{ margin: "0 0 var(--spacing-3)" }}>Today&apos;s Meal Service</Heading>
            <StatCards columns={4} stats={todayStats} />
          </div>

          {/* Caterer utilization */}
          <Card style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
            <div>
              <Heading as="h3" size="md" weight="bold" color="heading" style={{ margin: 0 }}>Caterer Utilization</Heading>
              <Text color="muted" size="sm" style={{ margin: "var(--spacing-1) 0 0" }}>
                Allocation against capacity for the active dining period.
              </Text>
            </div>
            {caterers.breakdown.length === 0 ? (
              <EmptyState icon={UtensilsCrossed} title="No Caterers" message="No caterers are configured for the active period yet." />
            ) : (
              <DataTable data={caterers.breakdown} columns={catererColumns} getRowId={(row) => row.id} />
            )}
          </Card>

          {/* Rebates */}
          <Card style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
            <HStack gap={2} align="center">
              <ClipboardCheck size={18} style={{ color: "var(--color-text-muted)" }} />
              <Heading as="h3" size="md" weight="bold" color="heading" style={{ margin: 0 }}>Rebates</Heading>
            </HStack>
            <Grid cols={{ base: 1, sm: 3 }} gap={3}>
              {[
                { label: "Pending approval", value: rebates.pending, tone: "var(--color-warning)" },
                { label: "Approved today", value: rebates.approvedToday, tone: "var(--color-success)" },
                { label: "Upcoming approved", value: rebates.upcoming, tone: "var(--color-primary)" },
              ].map((item) => (
                <div key={item.label} className="rounded-[var(--radius-lg)] border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-[var(--spacing-4)]">
                  <Text color="muted" size="sm">{item.label}</Text>
                  <Text color={item.tone} weight="bold" size="2xl">{item.value}</Text>
                </div>
              ))}
            </Grid>
          </Card>

          {/* Billing health */}
          <div>
            <Heading as="h3" size="md" weight="bold" color="heading" style={{ margin: "0 0 var(--spacing-3)" }}>Billing Health</Heading>
            <StatCards columns={4} stats={billingStats} />
          </div>
        </VStack>
      </Page.Body>
    </Page>
  )
}

export default DashboardPage
