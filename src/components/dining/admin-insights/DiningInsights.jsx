import { useMemo, useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Button } from "hzero"
import { diningInsightsApi } from "../../../service"
import { queryKeys } from "../../../lib/query/queryKeys"
import { useMinuteClock } from "../caterer/dashboard/dashboardHelpers"
import { PanelMessage } from "./InsightCard"
import TodayDial from "./TodayDial"
import RushWaves from "./RushWaves"
import WeekMood from "./WeekMood"
import AwayWeek from "./AwayWeek"
import FactTicker from "./FactTicker"
import { buildMealPalette, DEFAULT_DAYS, REFRESH_MS } from "./insightHelpers"
import "./DiningInsights.css"

/**
 * Admin dining dashboard: one screen, no scrolling. Today on a dial, the daily rush,
 * the weekly habit, who is away, and a ribbon of plain-language facts.
 */
const DiningInsights = ({ billing, rebates }) => {
  const [days, setDays] = useState(DEFAULT_DAYS)
  const nowMin = useMinuteClock()

  const query = useQuery({
    queryKey: queryKeys.diningInsights.overview({ days }),
    queryFn: () => diningInsightsApi.getDiningInsights({ days }),
    placeholderData: keepPreviousData,
    refetchInterval: REFRESH_MS,
    refetchOnWindowFocus: false,
    retry: 1,
  })
  const data = query.data
  const palette = useMemo(() => buildMealPalette(data?.mealSlots), [data?.mealSlots])
  const loading = query.isPending && !data

  if (query.isError && !data) {
    return (
      <div className="dxi">
        <section className="dxi-card dxi-unavailable">
          <PanelMessage title="Dining insights are unavailable right now" text="Please try again in a moment.">
            <Button variant="secondary" size="sm" onClick={() => query.refetch()} loading={query.isFetching}>Try again</Button>
          </PanelMessage>
        </section>
      </div>
    )
  }

  if (data && !(data.mealSlots || []).length) {
    return (
      <div className="dxi">
        <section className="dxi-card dxi-unavailable">
          <PanelMessage title="No dining service running" text="Start a dining period with meals and this dashboard comes alive." />
        </section>
      </div>
    )
  }

  const shared = { data, palette, nowMin, loading, days: data?.days || days }

  return (
    <div className="dxi">
      <div className="dxi-grid">
        <TodayDial {...shared} />
        <RushWaves {...shared} onDaysChange={setDays} />
        <WeekMood {...shared} />
        <AwayWeek {...shared} />
      </div>
      <FactTicker data={data} billing={billing} rebates={rebates} loading={loading} />
    </div>
  )
}

export default DiningInsights
