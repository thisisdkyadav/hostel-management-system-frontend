import { useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Button, EmptyState, ErrorState, LoadingState, Page, Skeleton } from "hzero"
import { Printer, UtensilsCrossed } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import { queryKeys } from "@/lib/query"
import { diningMenuApi } from "@/service"
import { localTodayKey } from "@/components/dining/caterer/catererHelpers"
import MenuInsights from "@/components/dining/menu/MenuInsights"
import MenuToolbar from "@/components/dining/menu/MenuToolbar"
import PrintSheet from "@/components/dining/menu/PrintSheet"
import WeekBoard from "@/components/dining/menu/WeekBoard"
import WeeklyMenuEditor from "@/components/dining/menu/WeeklyMenuEditor"
import useMenuRange from "@/components/dining/menu/useMenuRange"
import { VIEWS, addDays, buildBoard, getErrorMessage, weekStartOf } from "@/components/dining/menu/menuHelpers"
import "@/components/dining/menu/Menu.css"

const NO_KITCHENS = []
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/

/**
 * The dining menu. Admin and the Dining Office plan it per kitchen (a week board for single days, a
 * weekly menu kept as dated versions) and can browse every past week. A caterer login (`readOnly`) sees
 * only its own kitchen: the board and insights, no editing.
 */
const DiningMenuPage = ({ readOnly = false }) => {
  const [params, setParams] = useSearchParams()

  const caterersQuery = useQuery({
    queryKey: queryKeys.diningMenu.caterers(),
    queryFn: () => diningMenuApi.getCaterers(),
    enabled: !readOnly,
    refetchOnWindowFocus: false,
  })
  const kitchens = caterersQuery.data?.caterers || NO_KITCHENS
  const kitchenParam = params.get("kitchen")
  const catererId = readOnly ? "" : kitchens.find((kitchen) => kitchen.id === kitchenParam)?.id || kitchens[0]?.id || ""

  const views = useMemo(() => (readOnly ? VIEWS.filter((item) => item.id !== "weekly") : VIEWS), [readOnly])
  const viewParam = params.get("view")
  const view = views.some((item) => item.id === viewParam) ? viewParam : "board"

  const localToday = localTodayKey()
  const weekParam = params.get("week")
  const weekStart = weekStartOf(DATE_KEY.test(weekParam || "") ? weekParam : localToday)

  const setParam = (name, value, fallback) => {
    const next = new URLSearchParams(params)
    if (!value || value === fallback) next.delete(name)
    else next.set(name, value)
    setParams(next, { replace: true })
  }
  const setWeek = (key) => setParam("week", weekStartOf(key), weekStartOf(localToday))

  const rangeQuery = useMenuRange({
    readOnly,
    catererId,
    from: weekStart,
    to: addDays(weekStart, 6),
    enabled: view !== "insights",
  })
  const days = rangeQuery.data?.days
  const today = rangeQuery.data?.today || localToday
  const kitchenName = readOnly ? rangeQuery.data?.caterer?.name || "" : kitchens.find((kitchen) => kitchen.id === catererId)?.name || ""
  const mealRows = useMemo(() => buildBoard(days || []).rows, [days])

  const header = (
    <PageHeader
      title={readOnly ? "Menu" : "Dining Menu"}
      subtitle={
        readOnly ? "What your kitchen is serving, week by week." : "Plan what each kitchen serves, and look back at what was served."
      }
    >
      {view === "board" && days?.length > 0 && (
        <Button type="button" variant="secondary" size="sm" onClick={() => window.print()}>
          <Printer size={16} /> Print week
        </Button>
      )}
    </PageHeader>
  )

  if (!readOnly && caterersQuery.isPending) {
    return (
      <Page>
        {header}
        <Page.Body>
          <LoadingState message="Loading kitchens..." />
        </Page.Body>
      </Page>
    )
  }

  if (!readOnly && caterersQuery.isError) {
    return (
      <Page>
        {header}
        <Page.Body>
          <ErrorState
            message={getErrorMessage(caterersQuery.error, "Couldn't load the kitchens.")}
            onRetry={() => caterersQuery.refetch()}
          />
        </Page.Body>
      </Page>
    )
  }

  if (!readOnly && kitchens.length === 0) {
    return (
      <Page>
        {header}
        <Page.Body>
          <EmptyState icon={UtensilsCrossed} title="No kitchens yet" message="Add a caterer first, then you can plan its menu here." />
        </Page.Body>
      </Page>
    )
  }

  const renderBody = () => {
    if (view === "insights") return <MenuInsights readOnly={readOnly} catererId={catererId} weekStart={weekStart} />
    if (rangeQuery.isError && !days) {
      return <ErrorState message={getErrorMessage(rangeQuery.error, "Couldn't load the menu.")} onRetry={() => rangeQuery.refetch()} />
    }
    if (!days) return <Skeleton variant="rounded" height={360} />
    if (view === "weekly") {
      return <WeeklyMenuEditor key={catererId} catererId={catererId} kitchens={kitchens} mealRows={mealRows} today={today} />
    }
    return (
      <div className="dm-stage" data-stale={rangeQuery.isPlaceholderData || undefined}>
        <WeekBoard days={days} weekStart={weekStart} catererId={catererId} manage={!readOnly} today={today} />
      </div>
    )
  }

  return (
    <Page>
      {header}
      <Page.Body>
        <div className="dm-page">
          <MenuToolbar
            kitchens={readOnly ? null : kitchens}
            catererId={catererId}
            onKitchen={(id) => setParam("kitchen", id, kitchens[0]?.id)}
            weekStart={weekStart}
            onWeek={setWeek}
            today={today}
            view={view}
            onView={(id) => setParam("view", id, "board")}
            views={views}
            showWeek={view !== "weekly"}
          />
          {readOnly && kitchenName && <p className="dm-kitchen-name">{kitchenName}</p>}
          {renderBody()}
        </div>
        {days && view === "board" && <PrintSheet days={days} weekStart={weekStart} kitchenName={kitchenName} />}
      </Page.Body>
    </Page>
  )
}

export default DiningMenuPage
