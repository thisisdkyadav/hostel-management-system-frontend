import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button, StatusBadge } from "czero/react"
import { ArrowRight, CheckCircle2, Clock, RefreshCw, UtensilsCrossed, Users } from "lucide-react"
import { Alert, Card, LoadingState, StatCards, VStack } from "@/components/ui"
import PageHeader from "../../components/common/PageHeader"
import { catererApi } from "../../service"
import { useAuth } from "@/contexts/AuthProvider"
import CapacityBar from "@/components/dining/CapacityBar"

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

const DashboardPage = () => {
  const { user } = useAuth()
  const [context, setContext] = useState({ caterer: null, currentPeriod: null })
  const [mealState, setMealState] = useState({ total: 0, verifiedCount: 0, pendingCount: 0, rebateCount: 0, currentMealSlot: null })
  const [rebateSummary, setRebateSummary] = useState({ days: [] })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")

  const fetchAll = async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true)
    else setLoading(true)
    try {
      const [contextRes, studentsRes, rebateRes] = await Promise.all([
        catererApi.getMealVerificationContext(),
        catererApi.getCurrentMealStudents(),
        catererApi.getRebateSummary(),
      ])
      setContext(contextRes || { caterer: null, currentPeriod: null })
      setMealState({
        total: Number(studentsRes?.total || 0),
        verifiedCount: Number(studentsRes?.verifiedCount || 0),
        pendingCount: Number(studentsRes?.pendingCount || 0),
        rebateCount: Number(studentsRes?.rebateCount || 0),
        currentMealSlot: studentsRes?.currentMealSlot || null,
      })
      setRebateSummary({ days: Array.isArray(rebateRes?.days) ? rebateRes.days : [] })
      setError("")
    } catch (fetchError) {
      setError(getErrorMessage(fetchError, "Unable to load dashboard."))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const catererName = context.caterer?.name || user?.name || "Caterer"
  const mealSlot = mealState.currentMealSlot
  const hasActiveMeal = Boolean(mealSlot)

  const stats = [
    { title: "Allocated", value: mealState.total, subtitle: "Students this meal", icon: <Users size={20} />, color: "var(--color-primary)" },
    { title: "Verified", value: mealState.verifiedCount, subtitle: "Meals confirmed", icon: <CheckCircle2 size={20} />, color: "var(--color-success)" },
    { title: "Pending", value: mealState.pendingCount, subtitle: "Not yet scanned", icon: <Clock size={20} />, color: "var(--color-warning)" },
    { title: "On Rebate", value: mealState.rebateCount, subtitle: "Excused today", icon: <UtensilsCrossed size={20} />, color: "var(--color-text-muted)" },
  ]

  if (loading) {
    return <LoadingState message="Loading dashboard..." />
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Dashboard" subtitle={`Welcome back, ${catererName}`}>
        <Button variant="secondary" onClick={() => fetchAll({ silent: true })} disabled={refreshing}>
          <RefreshCw size={18} /> {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </PageHeader>

      <div className="flex-1 overflow-y-auto px-[var(--spacing-4)] md:px-[var(--spacing-6)] lg:px-[var(--spacing-8)] py-[var(--spacing-6)]">
        <VStack gap="large">
          {error && <Alert type="error" icon dismissible onDismiss={() => setError("")}>{error}</Alert>}

          {/* Today / current meal */}
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
                        {hasActiveMeal ? mealSlot.name : "No active meal"}
                      </h2>
                      <StatusBadge status={hasActiveMeal ? "Serving now" : "Idle"} tone={hasActiveMeal ? "success" : "primary"} showDot={hasActiveMeal} />
                    </div>
                    <p style={{ margin: "var(--spacing-1) 0 0", color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                      {hasActiveMeal ? `${mealSlot.startTime} – ${mealSlot.endTime}` : "Verification opens during meal hours"}
                    </p>
                    <p style={{ margin: "var(--spacing-1) 0 0", color: "var(--color-text-muted)", fontSize: "var(--font-size-xs)" }}>
                      {formatPeriodRange(context.currentPeriod)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-[300px] lg:flex-shrink-0">
                <CapacityBar allocated={mealState.verifiedCount} total={mealState.total} label="Verified this meal" />
                <Link to="/caterer/meal-verification" style={{ display: "block", marginTop: "var(--spacing-4)" }}>
                  <Button variant="primary" fullWidth>
                    Go to Meal Verification <ArrowRight size={18} />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          <StatCards columns={4} stats={stats} />

          {/* Availability forecast */}
          {rebateSummary.days.length > 0 && (
            <Card style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "var(--font-size-md)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-heading)" }}>Availability Forecast</h3>
                <p style={{ margin: "var(--spacing-1) 0 0", color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                  Expected diners today and the next two days, after approved rebates.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-[var(--spacing-3)]">
                {rebateSummary.days.map((day) => (
                  <div key={day.date} className="rounded-[var(--radius-lg)] border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-[var(--spacing-4)]">
                    <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>{formatDate(day.date)}</p>
                    <p style={{ color: "var(--color-text-heading)", fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-2xl)" }}>{day.availableStudentCount || 0}</p>
                    <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-xs)" }}>
                      of {day.allocatedStudentCount || 0} allocated · {day.approvedRebateCount || 0} on rebate
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </VStack>
      </div>
    </div>
  )
}

export default DashboardPage
