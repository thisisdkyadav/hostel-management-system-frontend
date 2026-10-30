import { useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { EmptyState, ErrorState, LoadingState, Page, Skeleton } from "hzero"
import { CalendarRange } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import { queryKeys } from "@/lib/query"
import { diningAllocationsApi } from "@/service"
import { buildCatererPalette } from "@/components/dining/caterer/diningScope"
import { getErrorMessage } from "@/components/dining/caterer/catererHelpers"
import AddStudentsModal from "@/components/dining/allocations/AddStudentsModal"
import AllocationStats from "@/components/dining/allocations/AllocationStats"
import AllocationTable from "@/components/dining/allocations/AllocationTable"
import KitchenStrip from "@/components/dining/allocations/KitchenStrip"
import PeriodRail from "@/components/dining/allocations/PeriodRail"
import StudentDrawer from "@/components/dining/allocations/StudentDrawer"
import { isEditablePeriod, validQuick } from "@/components/dining/allocations/allocationHelpers"
import "@/components/dining/allocations/Allocations.css"

const POLL_MS = 60_000
const NO_CATERERS = []

/**
 * The student roster of a dining period: who is allocated to which caterer.
 * One page for Admin and the Dining Office (every kitchen, can manage) and for a caterer
 * login (own kitchen, read-only). What the viewer may see and do comes from the API response.
 * `home` ("/admin" | "/dining-office" | "/caterer") is only used to link into billing cycles.
 */
const DiningAllocationsPage = ({ home }) => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showArchived, setShowArchived] = useState(false)
  const [openStudentId, setOpenStudentId] = useState(null)
  const [adding, setAdding] = useState(null)
  // The quick filter belongs to one period and phase; a different one starts from "all".
  const [quickState, setQuickState] = useState({ key: "", value: "all" })

  /* ---------- periods (the rail) ---------- */
  const periodsQuery = useQuery({
    queryKey: queryKeys.diningAllocations.periods({}),
    queryFn: () => diningAllocationsApi.getPeriods(),
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  })
  const periodsData = periodsQuery.data

  const oversightHint = Boolean(periodsData?.caterers)
  const kitchens = useMemo(
    () => periodsData?.caterers || (periodsData?.caterer ? [periodsData.caterer] : NO_CATERERS),
    [periodsData]
  )
  const palette = useMemo(() => buildCatererPalette(kitchens), [kitchens])

  const catererParam = oversightHint ? searchParams.get("caterer") || "" : ""
  const catererId = kitchens.some((item) => item.id === catererParam) ? catererParam : ""

  const periodParam = searchParams.get("period") || ""
  const allPeriods = useMemo(() => periodsData?.periods || [], [periodsData])
  const candidates = useMemo(
    () => (catererId ? allPeriods.filter((item) => (item.caterers || []).some((seat) => seat.id === catererId)) : allPeriods),
    [allPeriods, catererId]
  )
  const archivedCount = candidates.filter((item) => item.isArchived).length
  const visiblePeriods = useMemo(
    () => candidates.filter((item) => !item.isArchived || showArchived || item.id === periodParam),
    [candidates, showArchived, periodParam]
  )
  const selectedMeta =
    visiblePeriods.find((item) => item.id === periodParam) ||
    visiblePeriods.find((item) => item.id === periodsData?.defaultPeriodId) ||
    visiblePeriods[0] ||
    null
  const periodId = selectedMeta?.id || ""

  /* ---------- roster (the page body) ---------- */
  const rosterQuery = useQuery({
    queryKey: queryKeys.diningAllocations.roster({ periodId, catererId }),
    queryFn: () => diningAllocationsApi.getRoster({ periodId, ...(catererId ? { catererId } : {}) }),
    enabled: Boolean(periodId),
    placeholderData: keepPreviousData,
    refetchInterval: selectedMeta?.phase === "current" ? POLL_MS : false,
  })
  const roster = rosterQuery.data
  const period = roster?.period
  const oversight = roster ? Boolean(roster.scope?.oversight) : oversightHint
  const stale = Boolean(roster) && (rosterQuery.isPlaceholderData || roster.period?.id !== periodId)

  const quick = period ? validQuick(period.phase, oversight, quickState.key === `${period.id}|${period.phase}` ? quickState.value : "all") : "all"
  const setQuick = (value) => period && setQuickState({ key: `${period.id}|${period.phase}`, value })

  const students = useMemo(() => roster?.students || [], [roster])
  const openStudent = students.find((item) => item.id === openStudentId) || null
  const canManage = oversight && isEditablePeriod(period)

  /* ---------- URL ---------- */
  const writeParams = (mutate) => {
    const next = new URLSearchParams(searchParams)
    mutate(next)
    setSearchParams(next, { replace: true })
  }
  const pickPeriod = (id) => {
    const target = allPeriods.find((item) => item.id === id)
    writeParams((next) => {
      next.set("period", id)
      // A kitchen that does not serve that period would leave the rail empty.
      if (catererId && target && !(target.caterers || []).some((seat) => seat.id === catererId)) next.delete("caterer")
    })
    setOpenStudentId(null)
  }
  const pickCaterer = (id) =>
    writeParams((next) => {
      if (id) next.set("caterer", id)
      else next.delete("caterer")
    })

  /* ---------- states before the page proper ---------- */
  if (periodsQuery.isPending) return <LoadingState message="Loading allocations..." />

  if (periodsQuery.isError && !periodsData) {
    return (
      <Page>
        <PageHeader title="Allocations" />
        <Page.Body>
          <ErrorState message={getErrorMessage(periodsQuery.error, "Unable to load the dining periods.")} onRetry={() => periodsQuery.refetch()} />
        </Page.Body>
      </Page>
    )
  }

  const subtitle = oversight ? "Who eats where, period by period." : `Students allocated to ${periodsData?.caterer?.name || "your kitchen"}.`

  if (!selectedMeta) {
    const empty = catererId
      ? { title: "No dining periods for this kitchen", message: "Pick another kitchen, or add this one to a dining period." }
      : oversight
        ? { title: "No dining periods yet", message: "Once a dining period is set up, its allocations will show here." }
        : { title: "You're not in a dining period yet", message: "Once the dining office adds you to a period, the students allocated to you will show here." }
    return (
      <Page>
        <PageHeader title="Allocations" subtitle={subtitle} />
        <Page.Body>
          <div className="al-page">
            <EmptyState icon={CalendarRange} title={empty.title} message={empty.message} buttonText={catererId ? "Show all kitchens" : undefined} buttonAction={catererId ? () => pickCaterer("") : undefined} />
          </div>
        </Page.Body>
      </Page>
    )
  }

  return (
    <Page>
      <PageHeader title="Allocations" subtitle={subtitle} />
      <Page.Body>
        <div className="al-page">
          <PeriodRail
            periods={visiblePeriods}
            selectedId={periodId}
            catererId={catererId}
            onSelect={pickPeriod}
            archivedCount={archivedCount}
            showArchived={showArchived}
            onToggleArchived={setShowArchived}
          />

          <KitchenStrip caterers={selectedMeta.caterers} palette={palette} selectedId={catererId} oversight={oversight} onPick={pickCaterer} />

          {rosterQuery.isError && !roster ? (
            <ErrorState message={getErrorMessage(rosterQuery.error, "Unable to load this period.")} onRetry={() => rosterQuery.refetch()} />
          ) : !roster ? (
            <div className="al-page__loading" aria-busy="true">
              <Skeleton variant="rounded" height={88} />
              <Skeleton variant="rounded" height={320} />
            </div>
          ) : (
            <div className="al-body" data-stale={stale || undefined}>
              <AllocationStats
                period={period}
                summary={roster.summary}
                oversight={oversight}
                today={roster.today}
                onQuick={setQuick}
                onOpenCycle={() => navigate(`${home}/billing-cycles/${period.id}`)}
              />
              <AllocationTable
                period={period}
                slots={roster.mealSlots || []}
                students={students}
                tags={roster.tags}
                oversight={oversight}
                showCaterer={oversight && !catererId}
                palette={palette}
                quick={quick}
                onQuick={setQuick}
                canManage={canManage}
                onAdd={setAdding}
                onOpenStudent={setOpenStudentId}
                stale={stale}
              />
            </div>
          )}
        </div>

        <StudentDrawer
          student={openStudent}
          tags={roster?.tags}
          period={period}
          slots={roster?.mealSlots || []}
          caterers={selectedMeta.caterers || []}
          palette={palette}
          canManage={canManage}
          oversight={oversight}
          onClose={() => setOpenStudentId(null)}
          onPickPeriod={pickPeriod}
        />

        <AddStudentsModal
          isOpen={Boolean(adding) && canManage}
          mode={adding || "single"}
          periodId={periodId}
          caterers={selectedMeta.caterers || []}
          defaultCatererId={catererId}
          onClose={() => setAdding(null)}
        />
      </Page.Body>
    </Page>
  )
}

export default DiningAllocationsPage
