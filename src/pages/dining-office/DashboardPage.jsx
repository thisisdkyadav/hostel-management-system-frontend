import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ErrorState, LoadingState, Page } from "hzero"
import { Radio, UtensilsCrossed } from "lucide-react"
import PageHeader from "../../components/common/PageHeader"
import NeedsYou from "@/components/dining/office/NeedsYou"
import TodayCard from "@/components/dining/office/TodayCard"
import TurnoutWeek from "@/components/dining/office/TurnoutWeek"
import { SeatsCard, TomorrowCard } from "@/components/dining/office/SideCards"
import { addDays, formatRange, maxKey } from "@/components/dining/caterer/catererHelpers"
import { greetingFor } from "@/components/dining/caterer/dashboard/dashboardHelpers"
import { getErrorMessage } from "@/components/dining/diningPeriodHelpers"
import { diningOfficeApi, diningOversightApi } from "../../service"
import { queryKeys } from "@/lib/query"
import { useAuth } from "@/contexts/AuthProvider"
import "@/components/dining/office/OfficeDashboard.css"

const HOME = "/dining-office"
const REFRESH_MS = 60_000
const WEEK = 7

/**
 * Dining Office (wardens and hall supervisors): what needs doing, how today is going,
 * what to cook for tomorrow and how the last week went. Every number links to its page.
 */
const DashboardPage = () => {
  const { user } = useAuth()

  const officeQuery = useQuery({
    queryKey: queryKeys.diningOffice.dashboard(),
    queryFn: () => diningOfficeApi.getDashboard(),
    refetchInterval: REFRESH_MS,
    retry: 1,
  })
  const todayQuery = useQuery({
    queryKey: queryKeys.diningOversight.dailyReport({}),
    queryFn: () => diningOversightApi.getDailyReport({}),
    refetchInterval: REFRESH_MS,
  })

  const report = todayQuery.data
  const today = report?.today
  const tomorrowQuery = useQuery({
    queryKey: queryKeys.diningOversight.dailyReport({ date: today && addDays(today, 1) }),
    queryFn: () => diningOversightApi.getDailyReport({ date: addDays(today, 1) }),
    enabled: Boolean(today),
  })

  // The last full days of the running period (today is on the Today card).
  const period = report?.period
  const weekTo = today ? addDays(today, -1) : ""
  const weekFrom = period ? maxKey(addDays(today, -WEEK), period.startDate) : ""
  const weekParams = { periodId: period?.id, from: weekFrom, to: weekTo }
  const weekQuery = useQuery({
    queryKey: queryKeys.diningOversight.mealRecordOverview(weekParams),
    queryFn: () => diningOversightApi.getMealRecordOverview(weekParams),
    enabled: Boolean(period && weekFrom <= weekTo),
  })

  const office = officeQuery.data
  const firstName = String(user?.name || "").trim().split(/\s+/)[0]
  const now = new Date()
  const greeting = `${greetingFor(now.getHours() * 60 + now.getMinutes())}${firstName ? `, ${firstName}` : ""}`

  return (
    <Page>
      <PageHeader title="Dining" subtitle={period ? `${greeting} · period ${formatRange(period.startDate, period.endDate)}` : greeting}>
        <Link to={`${HOME}/live`} className="od-live-link">
          <span className="od-live-dot" aria-hidden="true" />
          <Radio size={16} aria-hidden="true" /> Watch live
        </Link>
      </PageHeader>

      <Page.Body>
        {todayQuery.isLoading ? (
          <LoadingState message="Loading today's meals..." />
        ) : todayQuery.isError ? (
          <ErrorState message={getErrorMessage(todayQuery.error, "Couldn't load today's meals.")} onRetry={() => todayQuery.refetch()} />
        ) : (
          <div className="od-page">
            <NeedsYou
              home={HOME}
              rebates={office?.rebates?.pending}
              checkOn={report.checkOn?.available ? report.checkOn.students.length : undefined}
              checkOnDays={report.days}
              issues={period ? report.totals.issueCount : 0}
              dues={office?.billing?.duesCount}
            />

            {period ? (
              <div className="od-layout">
                <div className="od-main">
                  <TodayCard home={HOME} report={report} dailyRate={office?.activePeriod?.dailyRate} />
                  <TurnoutWeek home={HOME} overview={weekQuery.data} />
                </div>
                <div className="od-side">
                  <TomorrowCard report={tomorrowQuery.data} />
                  <SeatsCard home={HOME} breakdown={office?.caterers?.breakdown} />
                </div>
              </div>
            ) : (
              <section className="od-card od-empty">
                <UtensilsCrossed size={28} aria-hidden="true" />
                <h2 className="od-card__title">No dining period is running today</h2>
                <p className="od-card__note">
                  Set one up under <Link to={`${HOME}/dining-periods`}>Dining periods</Link>.
                </p>
              </section>
            )}
          </div>
        )}
      </Page.Body>
    </Page>
  )
}

export default DashboardPage
