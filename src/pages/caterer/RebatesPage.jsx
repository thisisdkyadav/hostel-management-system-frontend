import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Button, Card, ErrorState, Heading, Page, Tabs, VStack } from "hzero"
import { RefreshCw } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import { catererApi } from "@/service"
import { queryKeys } from "@/lib/query"
import { addDays } from "@/components/dining/caterer/catererHelpers"
import TodayHero from "@/components/dining/caterer/rebates/TodayHero"
import HeadcountForecast from "@/components/dining/caterer/rebates/HeadcountForecast"
import AwayTodayPanel from "@/components/dining/caterer/rebates/AwayTodayPanel"
import ComingUpPanel from "@/components/dining/caterer/rebates/ComingUpPanel"
import RebateDayDrawer from "@/components/dining/caterer/rebates/RebateDayDrawer"
import RebateCalendar from "@/components/dining/caterer/rebates/RebateCalendar"
import RebateRequestsTable from "@/components/dining/caterer/rebates/RebateRequestsTable"
import { FORECAST_DAYS, OVERVIEW_REFRESH_MS, monthBounds, shiftMonth } from "@/components/dining/caterer/rebates/rebateHelpers"

const RebatesPage = () => {
  const queryClient = useQueryClient()
  const [drawerDate, setDrawerDate] = useState(null)
  const [historyTab, setHistoryTab] = useState("calendar")
  const [monthOffset, setMonthOffset] = useState(0)

  // Server picks "today" and the 14-day default range; refreshed every 5 minutes.
  const overview = useQuery({
    queryKey: queryKeys.caterer.rebateOverview({}),
    queryFn: () => catererApi.getRebateOverview({}),
    refetchInterval: OVERVIEW_REFRESH_MS,
  })
  const today = overview.data?.today || ""
  const days = overview.data?.days || []

  // Today's names; it shares its cache entry with the drawer for the same date.
  const todayDetail = useQuery({
    queryKey: queryKeys.caterer.rebateDay(today),
    queryFn: () => catererApi.getRebateDay(today),
    enabled: Boolean(today),
    refetchInterval: OVERVIEW_REFRESH_MS,
  })

  const todayRow = days.find((day) => day.date === today)
  const tomorrowRow = days.find((day) => day.date === addDays(today, 1))
  const month = shiftMonth(monthBounds(today || undefined).first, monthOffset)

  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.caterer.all })
  const refreshing = overview.isFetching || todayDetail.isFetching

  return (
    <Page>
      <PageHeader title="Rebates" subtitle="Students away from the mess, and what it means for your headcount">
        <Button variant="secondary" onClick={refresh} disabled={refreshing}>
          <RefreshCw size={18} /> {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </PageHeader>

      <Page.Body>
        {overview.isError && !overview.data ? (
          <ErrorState message="Could not load rebates." onRetry={() => overview.refetch()} />
        ) : (
          <VStack gap="large">
            <TodayHero day={todayRow} tomorrow={tomorrowRow} loading={overview.isPending} />

            <HeadcountForecast
              days={days.slice(0, FORECAST_DAYS)}
              today={today}
              selectedDate={drawerDate}
              onSelect={setDrawerDate}
              loading={overview.isPending}
            />

            <div className="reb-split-panels">
              <AwayTodayPanel
                data={todayDetail.data}
                today={today}
                loading={overview.isPending || todayDetail.isPending}
                error={todayDetail.isError}
                onRetry={() => todayDetail.refetch()}
              />
              <ComingUpPanel days={days} today={today} loading={overview.isPending} onSelect={setDrawerDate} />
            </div>

            <Card>
              <Heading as="h3" size="lg" weight="bold" color="heading" style={{ margin: "0 0 var(--spacing-3)" }}>History</Heading>
              <Tabs value={historyTab} onChange={setHistoryTab} variant="underline">
                <Tabs.List>
                  <Tabs.Trigger value="calendar">Calendar</Tabs.Trigger>
                  <Tabs.Trigger value="requests">All requests</Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="calendar">
                  <div style={{ paddingTop: "var(--spacing-4)" }}>
                    {historyTab === "calendar" && today && (
                      <RebateCalendar
                        month={month}
                        onMonthChange={(delta) => setMonthOffset((offset) => offset + delta)}
                        today={today}
                        onSelect={setDrawerDate}
                      />
                    )}
                  </div>
                </Tabs.Content>
                <Tabs.Content value="requests">
                  <div style={{ paddingTop: "var(--spacing-4)" }}>
                    {historyTab === "requests" && <RebateRequestsTable />}
                  </div>
                </Tabs.Content>
              </Tabs>
            </Card>
          </VStack>
        )}
      </Page.Body>

      <RebateDayDrawer date={drawerDate} onClose={() => setDrawerDate(null)} />
    </Page>
  )
}

export default RebatesPage
