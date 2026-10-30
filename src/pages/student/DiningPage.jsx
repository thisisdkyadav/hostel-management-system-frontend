import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Alert, Button, LoadingState, Page } from "hzero"
import { CalendarClock, UtensilsCrossed } from "lucide-react"
import PageHeader from "../../components/common/PageHeader"
import { studentApi } from "../../service"
import { queryKeys } from "@/lib/query"
import { formatDayLong, formatDayMonth, formatRange, localTodayKey } from "@/components/dining/caterer/catererHelpers"
import { getErrorMessage } from "@/components/dining/diningPeriodHelpers"
import TodayMeals from "@/components/dining/student/TodayMeals"
import MealHistory from "@/components/dining/student/MealHistory"
import AwayCard from "@/components/dining/student/AwayCard"
import BillCard from "@/components/dining/student/BillCard"
import TagAnswersCard from "@/components/dining/student/TagAnswersCard"
import { AwayModal, ChooseCatererModal, ConfirmCatererDialog } from "@/components/dining/student/DiningModals"
import { autoAssignLine, needsResponse } from "@/components/dining/student/studentDiningHelpers"
import useChooseCaterer from "@/components/dining/student/useChooseCaterer"
import { studentDiningPortalQuery, studentDiningTagsQuery } from "@/components/dining/student/portalQuery"
import "@/components/dining/student/StudentDining.css"

const SELECTING_REFRESH_MS = 5000
const IDLE_REFRESH_MS = 60000

const periodId = (period) => String(period?.id || period?._id || "")

const formatWhen = (value) =>
  value ? new Date(value).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : ""

/** One line under the header for anything about choosing a caterer. */
const Notice = ({ tone = "neutral", icon, title, text, action }) => (
  <div className="sd-notice" data-tone={tone}>
    <span className="sd-notice__icon" aria-hidden="true">
      {icon}
    </span>
    <div className="sd-notice__text">
      <strong>{title}</strong>
      {text && <span>{text}</span>}
    </div>
    {action}
  </div>
)

const DiningPage = () => {
  const queryClient = useQueryClient()
  const [choosing, setChoosing] = useState(false)
  const [pendingCaterer, setPendingCaterer] = useState(null)
  const [awayOpen, setAwayOpen] = useState(false)
  const [message, setMessage] = useState(null)

  const portalQuery = useQuery({
    ...studentDiningPortalQuery(),
    // Seats move fast only while a selection window is open.
    refetchInterval: (query) => (query.state.data?.canSelect ? SELECTING_REFRESH_MS : IDLE_REFRESH_MS),
  })
  const mealsQuery = useQuery({
    queryKey: queryKeys.dining.meals(),
    queryFn: () => studentApi.getDiningMeals(),
    refetchInterval: IDLE_REFRESH_MS,
  })
  const rebatesQuery = useQuery({
    queryKey: queryKeys.dining.rebates(),
    queryFn: () => studentApi.getDiningRebates(),
  })
  // The bill is a side card; if it fails to load the card just stays hidden.
  const billingQuery = useQuery({
    queryKey: queryKeys.dining.billing(),
    queryFn: () => studentApi.getDiningBilling(),
    retry: false,
  })

  // Preference questions are a bonus card; if they fail to load it just stays hidden.
  const tagsQuery = useQuery({ ...studentDiningTagsQuery(), retry: false })

  const portal = portalQuery.data || null
  const tagItems = tagsQuery.data?.items || []
  const tagsNeedResponse = tagItems.some(needsResponse)
  const meals = mealsQuery.data || null
  const rebates = rebatesQuery.data?.rebates || []
  const billingPeriods = billingQuery.data?.billingPeriods || []

  const currentPeriod = portal?.currentPeriod || null
  const openPeriod = portal?.activeAllocationPeriod || portal?.period || null
  const nextWindow = portal?.upcomingAllocationPeriod || null
  const canSelect = Boolean(portal?.canSelect && openPeriod)
  const currentAllocation = currentPeriod?.selectedAllocation || null
  const nextPeriod =
    [openPeriod, nextWindow, portal?.allocatedUpcomingPeriod].find(
      (period) => period?.selectedAllocation && periodId(period) !== periodId(currentPeriod)
    ) || null
  const needsChoice = canSelect && !openPeriod?.selectedAllocation

  const selectCaterer = useChooseCaterer({
    onSuccess: (_response, variables) => {
      setChoosing(false)
      setMessage({ type: "success", text: `You'll eat at ${variables.catererName}.` })
    },
    onError: (error) => setMessage({ type: "error", text: getErrorMessage(error, "Couldn't choose that caterer. Please try another.") }),
  })

  const requestAway = useMutation({
    mutationFn: (payload) => studentApi.requestDiningRebate(payload),
    onSuccess: (response) => {
      for (const key of [queryKeys.dining.rebates(), queryKeys.dining.billing(), queryKeys.dining.meals(), queryKeys.dining.portalState()]) {
        queryClient.invalidateQueries({ queryKey: key })
      }
      setAwayOpen(false)
      const pending = response?.rebates?.some((rebate) => rebate.status === "pending")
      setMessage({
        type: "success",
        text: pending ? "Sent to the dining office. You'll see it here once they approve it." : "Done. You won't be charged for those days.",
      })
    },
  })

  if (portalQuery.isLoading || mealsQuery.isLoading) return <LoadingState message="Loading your meals..." />

  const loadError = portalQuery.isError
    ? getErrorMessage(portalQuery.error, "Couldn't load your dining details.")
    : mealsQuery.isError
      ? getErrorMessage(mealsQuery.error, "Couldn't load your meals.")
      : ""

  const caterer = meals?.caterer || currentAllocation?.caterer || null
  const subtitle = caterer
    ? `${caterer.name} · until ${formatDayMonth((meals?.period || currentPeriod)?.endDate)}`
    : "No caterer right now"
  const chooseButton = (label) => (
    <Button variant="primary" size="sm" onClick={() => setChoosing(true)}>
      {label}
    </Button>
  )

  return (
    <Page>
      <PageHeader title="Dining" subtitle={subtitle} />
      <Page.Body>
        <div className="sd-page">
          <p className="sd-card__note sm:hidden">{subtitle}</p>
          {(message || loadError) && (
            <Alert
              type={message?.type || "error"}
              icon
              dismissible={Boolean(message)}
              onDismiss={() => setMessage(null)}
            >
              {message?.text || loadError}
            </Alert>
          )}

          {needsChoice && (
            <Notice
              tone="warning"
              icon={<UtensilsCrossed size={18} />}
              title={`Choose your caterer for ${formatRange(openPeriod.startDate, openPeriod.endDate)}`}
              text={autoAssignLine(openPeriod) || (openPeriod.allocationEndAt ? `Closes ${formatWhen(openPeriod.allocationEndAt)}` : "")}
              action={chooseButton("Choose")}
            />
          )}
          {!needsChoice && nextPeriod && (
            <Notice
              icon={<CalendarClock size={18} />}
              title={`From ${formatDayMonth(nextPeriod.startDate)}: ${nextPeriod.selectedAllocation?.caterer?.name || "your caterer"}`}
              text={formatRange(nextPeriod.startDate, nextPeriod.endDate)}
            />
          )}
          {!needsChoice && !nextPeriod && nextWindow && !openPeriod && (
            <Notice
              icon={<CalendarClock size={18} />}
              title="Choosing for the next period opens soon"
              text={formatWhen(nextWindow.allocationStartAt)}
            />
          )}

          {tagsNeedResponse && <TagAnswersCard items={tagItems} />}

          <div className="sd-layout">
            <div className="sd-main">
              {meals?.period ? (
                <>
                  <section className="sd-card">
                    <header className="sd-card__head">
                      <h2 className="sd-card__title">Today</h2>
                      <span className="sd-card__aside">{formatDayLong(meals.today)}</span>
                    </header>
                    <TodayMeals meals={meals.todayMeals} />
                  </section>
                  {meals.days.length > 1 && (
                    <section className="sd-card">
                      <header className="sd-card__head">
                        <h2 className="sd-card__title">Last {meals.days.length} days</h2>
                      </header>
                      <MealHistory slots={meals.mealSlots} days={meals.days} summary={meals.summary} today={meals.today} />
                    </section>
                  )}
                </>
              ) : (
                <section className="sd-card sd-empty">
                  <UtensilsCrossed size={28} aria-hidden="true" />
                  <h2 className="sd-card__title">You don&apos;t have a caterer right now</h2>
                  <p className="sd-card__note">
                    {needsChoice
                      ? "Choose one above and your meals will show up here."
                      : portal?.message || "When the next dining period opens, you can choose a caterer here."}
                  </p>
                </section>
              )}
            </div>

            <aside className="sd-side">
              {!tagsNeedResponse && <TagAnswersCard items={tagItems} />}
              <AwayCard rebates={rebates} today={meals?.today || localTodayKey()} canRequest onRequest={() => setAwayOpen(true)} />
              <BillCard billingPeriods={billingPeriods} />
            </aside>
          </div>
        </div>
      </Page.Body>

      {choosing && canSelect && (
        <ChooseCatererModal
          period={openPeriod}
          selectedCatererId={String(openPeriod?.selectedAllocation?.catererId || "")}
          selectingCatererId={selectCaterer.isPending ? selectCaterer.variables?.catererId : ""}
          onClose={() => setChoosing(false)}
          onSelect={setPendingCaterer}
        />
      )}

      {awayOpen && (
        <AwayModal
          onClose={() => setAwayOpen(false)}
          onSubmit={(payload) => requestAway.mutateAsync(payload)}
          isSubmitting={requestAway.isPending}
          longTermForm={rebatesQuery.data?.longTermForm || null}
          rules={rebatesQuery.data?.rules || null}
        />
      )}

      {pendingCaterer && (
        <ConfirmCatererDialog
          target={pendingCaterer}
          tags={openPeriod?.tags}
          onClose={() => setPendingCaterer(null)}
          onConfirm={(tagAnswers) => {
            const target = pendingCaterer
            setPendingCaterer(null)
            setMessage(null)
            selectCaterer.mutate({
              catererId: target.catererId,
              caterer: target.caterer,
              catererName: target.caterer?.name || "this caterer",
              periodId: periodId(openPeriod),
              tagAnswers,
            })
          }}
        />
      )}
    </Page>
  )
}

export default DiningPage
