import { useMemo } from "react"
import { Link } from "react-router-dom"
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query"
import { Button, IconButton, Page } from "hzero"
import { RefreshCw, ScanLine } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import { catererApi } from "@/service"
import { queryKeys } from "@/lib/query"
import { addDays, diffDays, formatRange, localTodayKey, toDayKey } from "@/components/dining/caterer/catererHelpers"
import CookForHero from "@/components/dining/caterer/dashboard/CookForHero"
import DayTrack from "@/components/dining/caterer/dashboard/DayTrack"
import NextDaysStrip from "@/components/dining/caterer/dashboard/NextDaysStrip"
import RecentMeals from "@/components/dining/caterer/dashboard/RecentMeals"
import DashboardRibbon from "@/components/dining/caterer/dashboard/DashboardRibbon"
import {
  FORECAST_AHEAD,
  LIVE_REFRESH_MS,
  OPTIONS_REFRESH_MS,
  OVERVIEW_REFRESH_MS,
  RECENT_DAYS,
  buildRecentMeals,
  greetingFor,
  summarizeMeals,
  useMinuteClock,
} from "@/components/dining/caterer/dashboard/dashboardHelpers"
import "@/components/dining/caterer/dashboard/Dashboard.css"

const DashboardPage = () => {
  const queryClient = useQueryClient()
  const nowMin = useMinuteClock()

  /* ---------- who, when, and which meal is open ---------- */
  const optionsQuery = useQuery({
    queryKey: queryKeys.caterer.mealRecordOptions(),
    queryFn: () => catererApi.getMealRecordOptions(),
    refetchInterval: OPTIONS_REFRESH_MS,
    refetchOnWindowFocus: false,
  })
  const options = optionsQuery.data
  const today = options?.today || localTodayKey()
  const periodId = options?.currentPeriodId || ""
  const currentMealSlotKey = options?.currentMealSlotKey || ""
  const period = useMemo(
    () => options?.periods?.find((item) => item.id === periodId) || null,
    [options, periodId]
  )
  const slots = period?.mealSlots

  /* ---------- today and the days ahead (whole-day rebates) ---------- */
  const rebateParams = { from: today, to: addDays(today, FORECAST_AHEAD) }
  const rebateQuery = useQuery({
    queryKey: queryKeys.caterer.rebateOverview(rebateParams),
    queryFn: () => catererApi.getRebateOverview(rebateParams),
    placeholderData: keepPreviousData,
    refetchInterval: OVERVIEW_REFRESH_MS,
  })
  const rebateDays = rebateQuery.data?.days
  const todayRow = rebateDays?.find((day) => day.date === today) || null
  const nextDays = (rebateDays || [])
    .filter((day) => day.date > today && day.periodId)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, FORECAST_AHEAD)

  /* ---------- recent meals ---------- */
  const mealParams = { periodId, from: addDays(today, -(RECENT_DAYS - 1)), to: today }
  const overviewQuery = useQuery({
    queryKey: queryKeys.caterer.mealRecordOverview(mealParams),
    queryFn: () => catererApi.getMealRecordOverview(mealParams),
    enabled: Boolean(periodId),
    placeholderData: keepPreviousData,
    refetchInterval: OVERVIEW_REFRESH_MS,
  })
  const overview = overviewQuery.data
  const overviewSlots = overview?.mealSlots?.length ? overview.mealSlots : slots

  /* ---------- live count for the meal being served ---------- */
  const liveParams = { periodId, date: today, mealSlotKey: currentMealSlotKey }
  const liveQuery = useQuery({
    queryKey: queryKeys.caterer.mealRecord(liveParams),
    queryFn: () => catererApi.getMealRecord(liveParams),
    enabled: Boolean(periodId && currentMealSlotKey),
    refetchInterval: LIVE_REFRESH_MS,
  })

  /* ---------- derived ---------- */
  const todayMeals = overview?.days?.find((day) => day.date === today)
  const trackInput = useMemo(() => {
    if (!slots?.length) return null
    const verifiedByKey = {}
    for (const slot of slots) verifiedByKey[slot.key] = todayMeals?.meals?.[slot.key]?.verifiedCount ?? 0
    return {
      slots,
      nowMin,
      currentMealSlotKey,
      verifiedByKey,
      expected: todayMeals?.expectedCount ?? todayRow?.expectedCount ?? 0,
      live: liveQuery.data?.summary || null,
    }
  }, [slots, nowMin, currentMealSlotKey, todayMeals, todayRow, liveQuery.data])

  const recentMeals = useMemo(
    () => buildRecentMeals({ days: overview?.days, slots: overviewSlots, today, nowMin }),
    [overview, overviewSlots, today, nowMin]
  )
  const recentSummary = useMemo(() => summarizeMeals(recentMeals), [recentMeals])

  const periodEnd = period ? toDayKey(period.endDate) : ""
  const periodEndsIn = periodEnd ? diffDays(today, periodEnd) : null

  const catererName = options?.caterer?.name
  const subtitle = [
    catererName ? `${greetingFor(nowMin)}, ${catererName}` : greetingFor(nowMin),
    period ? `dining period ${formatRange(period.startDate, period.endDate)}` : null,
  ]
    .filter(Boolean)
    .join(", ")

  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.caterer.all })
  const refreshing = optionsQuery.isFetching || rebateQuery.isFetching || overviewQuery.isFetching

  const optionsLoading = optionsQuery.isPending
  const noPeriod = !optionsLoading && !periodId

  return (
    <Page>
      <PageHeader title="Dashboard" subtitle={subtitle}>
        <IconButton
          variant="secondary"
          icon={<RefreshCw size={18} className={refreshing ? "animate-spin" : undefined} />}
          ariaLabel="Refresh dashboard"
          title="Refresh"
          onClick={refresh}
          disabled={refreshing}
        />
        <Link to="/caterer/meal-verification">
          <Button variant="primary">
            <ScanLine size={18} /> Verify meals
          </Button>
        </Link>
      </PageHeader>

      <Page.Body className="cdb-body">
        <div className="cdb-grid">
          <CookForHero
            day={todayRow}
            loading={rebateQuery.isPending}
            error={rebateQuery.isError}
            onRetry={() => rebateQuery.refetch()}
          >
            <DayTrack
              input={trackInput}
              today={today}
              periodId={periodId}
              loading={optionsLoading}
            />
          </CookForHero>

          <NextDaysStrip
            days={nextDays}
            today={today}
            todayExpected={todayRow?.expectedCount ?? 0}
            loading={rebateQuery.isPending}
            error={rebateQuery.isError}
            onRetry={() => rebateQuery.refetch()}
          />

          <RecentMeals
            meals={recentMeals}
            summary={recentSummary}
            periodId={periodId}
            loading={optionsLoading || (Boolean(periodId) && overviewQuery.isPending)}
            error={noPeriod ? false : overviewQuery.isError}
            noPeriod={noPeriod}
            onRetry={() => overviewQuery.refetch()}
          />

          <DashboardRibbon
            day={todayRow}
            periodEndsIn={periodEndsIn}
            loadingDay={rebateQuery.isPending}
            loadingPeriod={optionsLoading}
          />
        </div>
      </Page.Body>
    </Page>
  )
}

export default DashboardPage
