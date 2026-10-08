import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Button, EmptyState, ErrorState, LoadingState, Page, Select, Skeleton } from "hzero"
import { Download, UtensilsCrossed } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import { catererApi } from "@/service"
import { queryKeys } from "@/lib/query"
import { addDays, getErrorMessage, localTodayKey, toDayKey } from "@/components/dining/caterer/catererHelpers"
import ServiceGrid from "@/components/dining/caterer/meal-records/ServiceGrid"
import ServiceSummary from "@/components/dining/caterer/meal-records/ServiceSummary"
import MealRoster from "@/components/dining/caterer/meal-records/MealRoster"
import ScannerIssues from "@/components/dining/caterer/meal-records/ScannerIssues"
import {
  buildRosterCsv,
  clampWindowEnd,
  defaultSelection,
  downloadCsv,
  formatPeriodRange,
  isDayKey,
  nowMinutes,
  periodOptionLabel,
  SHIFT_DAYS,
  sortSlots,
  windowEndFor,
  windowFromEnd,
} from "@/components/dining/caterer/meal-records/mealRecordsHelpers"
import "@/components/dining/caterer/meal-records/MealRecords.css"

const POLL_MS = 60_000

const MealRecordsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  // The window's last day once the user has paged it; tied to a period so a period switch starts fresh.
  const [pagedWindow, setPagedWindow] = useState({ periodId: "", end: "" })

  /* ---------- options (periods, today, meal open now) ---------- */
  const optionsQuery = useQuery({
    queryKey: queryKeys.caterer.mealRecordOptions(),
    queryFn: () => catererApi.getMealRecordOptions(),
    refetchOnWindowFocus: false,
  })
  const options = optionsQuery.data
  const periods = useMemo(() => options?.periods ?? [], [options])

  const periodParam = searchParams.get("period")
  const period =
    periods.find((item) => item.id === periodParam) ||
    periods.find((item) => item.id === options?.currentPeriodId) ||
    periods[0] ||
    null
  const periodId = period?.id || ""
  const periodStart = period ? toDayKey(period.startDate) : ""
  const periodEnd = period ? toDayKey(period.endDate) : ""
  const today = options?.today || localTodayKey()
  const slots = useMemo(() => sortSlots(period?.mealSlots), [period])

  /* ---------- selection lives in the URL ---------- */
  const fallback = useMemo(
    () =>
      period && slots.length
        ? defaultSelection({ period: { ...period, mealSlots: slots }, today, currentMealSlotKey: options?.currentMealSlotKey, nowMin: nowMinutes() })
        : null,
    [period, slots, today, options?.currentMealSlotKey]
  )
  const dateParam = searchParams.get("date")
  const mealParam = searchParams.get("meal")
  const date = isDayKey(dateParam) && dateParam >= periodStart && dateParam <= periodEnd ? dateParam : fallback?.date || ""
  const meal = slots.some((slot) => slot.key === mealParam) ? mealParam : fallback?.meal || ""

  // Write the resolved selection back once, so a reload or a shared link lands on the same service.
  useEffect(() => {
    if (!periodId || !date || !meal) return
    if (searchParams.get("period") === periodId && dateParam === date && mealParam === meal) return
    const next = new URLSearchParams(searchParams)
    next.set("period", periodId)
    next.set("date", date)
    next.set("meal", meal)
    setSearchParams(next, { replace: true })
  }, [periodId, date, meal, dateParam, mealParam, searchParams, setSearchParams])

  const writeSelection = (nextPeriod, nextDate, nextMeal) => {
    const next = new URLSearchParams(searchParams)
    next.set("period", nextPeriod)
    next.set("date", nextDate)
    next.set("meal", nextMeal)
    setSearchParams(next, { replace: true })
  }

  /* ---------- the 14-day window ---------- */
  const paged = pagedWindow.periodId === periodId && pagedWindow.end ? pagedWindow.end : ""
  const windowEnd = period
    ? clampWindowEnd(paged || windowEndFor(date || today, today, periodStart, periodEnd), periodStart, periodEnd)
    : ""
  const { from: windowFrom, to: windowTo } = period ? windowFromEnd(windowEnd, periodStart) : { from: "", to: "" }

  const shiftWindow = (direction) => {
    const end = clampWindowEnd(addDays(windowEnd, direction * SHIFT_DAYS), periodStart, periodEnd)
    setPagedWindow({ periodId, end })
  }

  const jumpToDate = (nextDate) => {
    if (nextDate < windowFrom || nextDate > windowTo) {
      setPagedWindow({ periodId, end: clampWindowEnd(addDays(nextDate, SHIFT_DAYS - 1), periodStart, periodEnd) })
    }
    writeSelection(periodId, nextDate, meal)
  }

  const changePeriod = (nextId) => {
    const nextPeriod = periods.find((item) => item.id === nextId)
    if (!nextPeriod) return
    const nextSlots = sortSlots(nextPeriod.mealSlots)
    const pick = defaultSelection({
      period: { ...nextPeriod, mealSlots: nextSlots },
      today,
      currentMealSlotKey: nextPeriod.isCurrent ? options?.currentMealSlotKey : null,
      nowMin: nowMinutes(),
    })
    setPagedWindow({ periodId: "", end: "" })
    writeSelection(nextId, pick.date, pick.meal)
  }

  /* ---------- overview (the grid) ---------- */
  const overviewParams = { periodId, from: windowFrom, to: windowTo }
  const mealIsOpen = Boolean(options?.currentMealSlotKey) && periodId === options?.currentPeriodId && windowTo >= today
  const overviewQuery = useQuery({
    queryKey: queryKeys.caterer.mealRecordOverview(overviewParams),
    queryFn: () => catererApi.getMealRecordOverview(overviewParams),
    enabled: Boolean(periodId && slots.length && windowFrom && windowTo),
    placeholderData: keepPreviousData,
    refetchInterval: mealIsOpen ? POLL_MS : false,
  })
  const dayMap = useMemo(() => new Map((overviewQuery.data?.days || []).map((day) => [day.date, day])), [overviewQuery.data])

  /* ---------- the selected service ---------- */
  const recordParams = { periodId, date, mealSlotKey: meal }
  const recordQuery = useQuery({
    queryKey: queryKeys.caterer.mealRecord(recordParams),
    queryFn: () => catererApi.getMealRecord(recordParams),
    enabled: Boolean(periodId && date && meal),
    placeholderData: keepPreviousData,
    // Only a meal that is being served right now changes under us.
    refetchInterval: (query) => (query.state.data?.mealState === "serving" ? POLL_MS : false),
  })
  const record = recordQuery.data
  const recordMatches = Boolean(record) && record.date === date && record.mealSlot?.key === meal
  const slot = slots.find((item) => item.key === meal) || null

  const exportCsv = () => {
    if (!recordMatches) return
    downloadCsv(`meal-records-${meal}-${date}.csv`, buildRosterCsv(record))
  }

  /* ---------- states before the page proper ---------- */
  if (optionsQuery.isPending) return <LoadingState message="Loading meal records..." />

  if (optionsQuery.isError) {
    return (
      <Page>
        <PageHeader title="Meal records" />
        <Page.Body>
          <ErrorState
            message={getErrorMessage(optionsQuery.error, "Unable to load your dining periods.")}
            onRetry={() => optionsQuery.refetch()}
          />
        </Page.Body>
      </Page>
    )
  }

  if (!period) {
    return (
      <Page>
        <PageHeader title="Meal records" />
        <Page.Body>
          <EmptyState
            icon={UtensilsCrossed}
            title="You're not assigned to a dining period yet"
            message="Once the dining office assigns you to a period, every meal you serve will be logged here."
          />
        </Page.Body>
      </Page>
    )
  }

  const periodChoices = periods.map((item) => ({ value: item.id, label: periodOptionLabel(item) }))

  return (
    <Page>
      <PageHeader title="Meal records" subtitle={formatPeriodRange(period.startDate, period.endDate)}>
        {periods.length > 1 && (
          <Select
            size="small"
            value={periodId}
            onChange={(event) => changePeriod(event.target.value)}
            options={periodChoices}
            aria-label="Dining period"
          />
        )}
        <Button variant="secondary" size="sm" onClick={exportCsv} disabled={!recordMatches}>
          <Download size={16} /> Export CSV
        </Button>
      </PageHeader>

      <Page.Body>
        <div className="mr-page">
          {slots.length === 0 ? (
            <EmptyState
              icon={UtensilsCrossed}
              title="This period has no meals"
              message="The dining office has not set up any meal times for this period."
            />
          ) : overviewQuery.isError && !overviewQuery.data ? (
            <ErrorState
              message={getErrorMessage(overviewQuery.error, "Unable to load the service grid.")}
              onRetry={() => overviewQuery.refetch()}
            />
          ) : (
            <ServiceGrid
              slots={slots}
              windowFrom={windowFrom}
              windowTo={windowTo}
              dayMap={dayMap}
              today={today}
              nowMin={nowMinutes()}
              selectedDate={date}
              selectedMeal={meal}
              loading={!overviewQuery.data}
              periodStart={periodStart}
              periodEnd={periodEnd}
              canPrev={windowFrom > periodStart}
              canNext={windowTo < periodEnd}
              onSelect={(nextDate, nextMeal) => writeSelection(periodId, nextDate, nextMeal)}
              onShift={shiftWindow}
              onJump={jumpToDate}
            />
          )}

          {slots.length > 0 && (
            <>
              <ServiceSummary
                slot={slot}
                date={date}
                record={record}
                stale={Boolean(record) && !recordMatches}
                loading={recordQuery.isPending}
                error={recordQuery.isError ? getErrorMessage(recordQuery.error, "Unable to load this meal.") : ""}
                onRetry={() => recordQuery.refetch()}
              />

              {record ? (
                <MealRoster record={record} stale={!recordMatches} />
              ) : (
                recordQuery.isPending && <Skeleton variant="rounded" height={240} />
              )}

              {recordMatches && <ScannerIssues issues={record.issues} issueCount={record.summary?.issueCount || 0} />}
            </>
          )}
        </div>
      </Page.Body>
    </Page>
  )
}

export default MealRecordsPage
