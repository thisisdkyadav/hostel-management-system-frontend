import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CalendarClock,
  Check,
  Clock,
  Info,
  Plane,
  UtensilsCrossed,
  X,
  Receipt,
} from "lucide-react";
import { useToast } from "hzero";
import { studentApi } from "../../../service";
import { queryKeys } from "../../../lib/query";
import {
  formatDayMonth,
  formatRange,
  localTodayKey,
} from "../../dining/caterer/catererHelpers";
import { getErrorMessage } from "../../dining/diningPeriodHelpers";
import MealHistory from "../../dining/student/MealHistory";
import AwayCard from "../../dining/student/AwayCard";
import BillCard from "../../dining/student/BillCard";
import TagAnswersCard from "../../dining/student/TagAnswersCard";
import BioPhotoCard from "../../dining/student/BioPhotoCard";
import {
  AwayModal,
  ChooseCatererModal,
  ConfirmCatererDialog,
} from "../../dining/student/DiningModals";
import {
  autoAssignLine,
  issueLine,
  mealLine,
  needsResponse,
} from "../../dining/student/studentDiningHelpers";
import useChooseCaterer from "../../dining/student/useChooseCaterer";
import { studentDiningPortalQuery } from "../../dining/student/portalQuery";
import {
  diningBillingQuery,
  diningRebatesQuery,
  diningTagsQuery,
  mealsQuery as mealsQuery_,
} from "../phoneQueries";
import Segmented from "../kit/Segmented";
import { renderSheetModal } from "../kit/SheetModal";
import { ModalOverrideContext } from "../../common/AdaptiveModal";
import PhoneMenu from "./PhoneMenu";
import "../../dining/student/StudentDining.css";

const SELECTING_REFRESH_MS = 5000;
const IDLE_REFRESH_MS = 60000;
const periodId = (period) => String(period?.id || period?._id || "");
const formatWhen = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

const TABS = [
  { value: "menu", label: "Menu" },
  { value: "meals", label: "My meals" },
  { value: "rebates", label: "Rebates" },
  { value: "bills", label: "Bills" },
];

const MEAL_ICON = { ate: Check, missed: X, away: Plane, upcoming: Clock };

const Notice = ({ tone = "neutral", icon, title, text, action }) => (
  <div className="md-notice" data-tone={tone}>
    <span className="md-notice__icon" aria-hidden="true">
      {icon}
    </span>
    <span className="md-notice__text">
      <strong>{title}</strong>
      {text && <span>{text}</span>}
    </span>
    {action}
  </div>
);

/** Dining on a phone: who's feeding you, then Menu / My meals / Away & bill as tabs. */
const PhoneDining = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("menu");
  const [choosing, setChoosing] = useState(false);
  const [pendingCaterer, setPendingCaterer] = useState(null);
  const [awayOpen, setAwayOpen] = useState(false);

  const portalQuery = useQuery({
    ...studentDiningPortalQuery(),
    refetchInterval: (query) =>
      query.state.data?.canSelect ? SELECTING_REFRESH_MS : IDLE_REFRESH_MS,
  });
  const mealsQuery = useQuery({
    ...mealsQuery_(),
    refetchInterval: IDLE_REFRESH_MS,
  });
  const rebatesQuery = useQuery(diningRebatesQuery());
  const billingQuery = useQuery(diningBillingQuery());
  const tagsQuery = useQuery(diningTagsQuery());

  const portal = portalQuery.data || null;
  const meals = mealsQuery.data || null;
  const tagItems = tagsQuery.data?.items || [];
  const tagsNeedResponse = tagItems.some(needsResponse);
  const rebates = rebatesQuery.data?.rebates || [];
  const billingPeriods = billingQuery.data?.billingPeriods || [];
  const currentPeriod = portal?.currentPeriod || null;
  const openPeriod = portal?.activeAllocationPeriod || portal?.period || null;
  const nextWindow = portal?.upcomingAllocationPeriod || null;
  const canSelect = Boolean(portal?.canSelect && openPeriod);
  const currentAllocation = currentPeriod?.selectedAllocation || null;
  const nextPeriod =
    [openPeriod, nextWindow, portal?.allocatedUpcomingPeriod].find(
      (period) =>
        period?.selectedAllocation &&
        periodId(period) !== periodId(currentPeriod),
    ) || null;
  const needsChoice = canSelect && !openPeriod?.selectedAllocation;
  const unregisteredPeriods = [
    currentPeriod,
    openPeriod,
    nextWindow,
    portal?.allocatedUpcomingPeriod,
  ].filter(
    (period, index, list) =>
      period?.selectedAllocation?.unregistered &&
      list.findIndex(
        (other) => other && periodId(other) === periodId(period),
      ) === index,
  );

  const selectCaterer = useChooseCaterer({
    onSuccess: (_response, variables) => {
      setChoosing(false);
      toast.success(`You'll eat at ${variables.catererName}.`);
    },
    onError: (error) =>
      toast.error(
        getErrorMessage(
          error,
          "Couldn't choose that caterer. Please try another.",
        ),
      ),
  });

  const requestAway = useMutation({
    mutationFn: (payload) => studentApi.requestDiningRebate(payload),
    onSuccess: (response) => {
      for (const key of [
        queryKeys.dining.rebates(),
        queryKeys.dining.billing(),
        queryKeys.dining.meals(),
        queryKeys.dining.portalState(),
      ]) {
        queryClient.invalidateQueries({ queryKey: key });
      }
      setAwayOpen(false);
      const pending = response?.rebates?.some(
        (rebate) => rebate.status === "pending",
      );
      toast.success(
        pending
          ? "Sent to the dining office. It shows here once approved."
          : "Done. You won't be charged for those days.",
      );
    },
  });

  const caterer = meals?.caterer || currentAllocation?.caterer || null;
  // Only when there is nothing to show: a failed background refresh keeps the old data on screen.
  const loadError =
    portalQuery.isError && !portalQuery.data
      ? getErrorMessage(portalQuery.error, "Couldn't load your dining details.")
      : mealsQuery.isError && !mealsQuery.data
        ? getErrorMessage(mealsQuery.error, "Couldn't load your meals.")
        : "";
  const loading = portalQuery.isLoading || mealsQuery.isLoading;

  const mealsTab = () => {
    if (!meals?.period) {
      return (
        <div className="mk-empty">
          <span className="mk-empty__icon">
            <UtensilsCrossed size={26} />
          </span>
          <p className="mk-empty__title">No caterer right now</p>
          <p className="mk-sub">
            {needsChoice
              ? "Choose one above and your meals will show up here."
              : portal?.message ||
                "When the next dining period opens, you can choose a caterer here."}
          </p>
        </div>
      );
    }
    return (
      <>
        <h2 className="mk-label">Today</h2>
        <ul className="mk-list md-today">
          {(meals.todayMeals || []).map((meal) => {
            const Icon = MEAL_ICON[meal.status] || Clock;
            const issue = issueLine(meal);
            return (
              <li
                key={meal.key}
                className="md-today__row"
                data-status={meal.status}
              >
                <span className="md-today__icon" aria-hidden="true">
                  {meal.status === "serving" ? (
                    <span className="mh-live" />
                  ) : (
                    <Icon size={15} strokeWidth={2.75} />
                  )}
                </span>
                <span className="md-today__main">
                  <span className="md-today__name">{meal.name}</span>
                  <span className="mk-sub">{mealLine(meal)}</span>
                  {issue && (
                    <span className="md-today__issue">
                      <AlertTriangle size={12} aria-hidden="true" /> {issue}
                    </span>
                  )}
                </span>
                <span className="md-today__time">
                  {meal.startTime}–{meal.endTime}
                </span>
              </li>
            );
          })}
        </ul>
        {meals.days?.length > 1 && (
          <>
            <h2 className="mk-label">Last {meals.days.length} days</h2>
            <div className="md-plain">
              <MealHistory
                slots={meals.mealSlots}
                days={meals.days}
                summary={meals.summary}
                today={meals.today}
              />
            </div>
          </>
        )}
      </>
    );
  };

  const rebatesTab = () => (
    <div className="md-plain md-stack">
      <AwayCard
        rebates={rebates}
        today={meals?.today || localTodayKey()}
        canRequest
        onRequest={() => setAwayOpen(true)}
        unregisteredPeriods={
          rebatesQuery.data?.rules?.unregisteredPeriods || []
        }
      />
      {!tagsNeedResponse && <TagAnswersCard items={tagItems} />}
      <BioPhotoCard />
    </div>
  );

  const billsTab = () => (
    <div className="md-plain md-stack">
      {billingQuery.isPending ? (
        <p className="mk-sub">Loading your bills…</p>
      ) : billingPeriods.length ? (
        <BillCard billingPeriods={billingPeriods} />
      ) : (
        <div className="mk-empty">
          <span className="mk-empty__icon">
            <Receipt size={26} />
          </span>
          <p className="mk-empty__title">No bills yet</p>
          <p className="mk-sub">
            Your mess bill shows up here once the dining office prepares it.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <ModalOverrideContext.Provider value={renderSheetModal}>
      <div className="mk-page md">
        <h1 className="mk-title">Dining</h1>
        <p className="md-caterer">
          {caterer ? (
            <>
              <UtensilsCrossed size={15} aria-hidden="true" />
              <span>
                <b>{caterer.name}</b> · until{" "}
                {formatDayMonth((meals?.period || currentPeriod)?.endDate)}
              </span>
            </>
          ) : loading ? (
            "Loading…"
          ) : (
            "No caterer right now"
          )}
        </p>

        {loadError && (
          <Notice
            tone="danger"
            icon={<AlertTriangle size={17} />}
            title={loadError}
          />
        )}
        {needsChoice && (
          <Notice
            tone="warning"
            icon={<UtensilsCrossed size={17} />}
            title={`Choose your caterer for ${formatRange(openPeriod.startDate, openPeriod.endDate)}`}
            text={
              autoAssignLine(openPeriod) ||
              (openPeriod.allocationEndAt
                ? `Closes ${formatWhen(openPeriod.allocationEndAt)}`
                : "")
            }
            action={
              <button
                type="button"
                className="mk-btn mk-btn--primary mk-btn--sm"
                onClick={() => setChoosing(true)}
              >
                Choose
              </button>
            }
          />
        )}
        {!needsChoice && nextPeriod && (
          <Notice
            icon={<CalendarClock size={17} />}
            title={`From ${formatDayMonth(nextPeriod.startDate)}: ${nextPeriod.selectedAllocation?.caterer?.name || "your caterer"}`}
            text={formatRange(nextPeriod.startDate, nextPeriod.endDate)}
          />
        )}
        {!needsChoice && !nextPeriod && nextWindow && !openPeriod && (
          <Notice
            icon={<CalendarClock size={17} />}
            title="Choosing for the next period opens soon"
            text={formatWhen(nextWindow.allocationStartAt)}
          />
        )}
        {unregisteredPeriods.map((period) => (
          <Notice
            key={periodId(period)}
            tone="warning"
            icon={<Info size={17} />}
            title="You didn't choose a caterer in time, so you were assigned one."
            text={`Rebates aren't available for ${formatRange(period.startDate, period.endDate)}.`}
          />
        ))}
        {tagsNeedResponse && (
          <div className="md-plain">
            <TagAnswersCard items={tagItems} />
          </div>
        )}

        <div className="md-tabs">
          <Segmented
            label="Dining sections"
            options={TABS}
            value={tab}
            onChange={setTab}
            stretch
          />
        </div>

        {tab === "menu" && <PhoneMenu />}
        {tab === "meals" &&
          (loading ? (
            <p className="mk-sub">Loading your meals…</p>
          ) : (
            mealsTab()
          ))}
        {tab === "rebates" && rebatesTab()}
        {tab === "bills" && billsTab()}

        {choosing && canSelect && (
          <ChooseCatererModal
            period={openPeriod}
            selectedCatererId={String(
              openPeriod?.selectedAllocation?.catererId || "",
            )}
            selectingCatererId={
              selectCaterer.isPending ? selectCaterer.variables?.catererId : ""
            }
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
              const target = pendingCaterer;
              setPendingCaterer(null);
              selectCaterer.mutate({
                catererId: target.catererId,
                caterer: target.caterer,
                catererName: target.caterer?.name || "this caterer",
                periodId: periodId(openPeriod),
                tagAnswers,
              });
            }}
          />
        )}
      </div>
    </ModalOverrideContext.Provider>
  );
};

export default PhoneDining;
