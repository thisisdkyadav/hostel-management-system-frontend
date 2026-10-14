import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  Button,
  DatePicker,
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
  Page,
  Select,
  Skeleton,
} from "hzero";
import {
  CalendarX2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  Radio,
} from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { diningOversightApi } from "@/service";
import { queryKeys } from "@/lib/query";
import { buildCatererPalette } from "@/components/dining/caterer/diningScope";
import {
  addDays,
  formatDayLong,
  getErrorMessage,
  localTodayKey,
  percent,
  relativeDay,
} from "@/components/dining/caterer/catererHelpers";
import {
  downloadCsv,
  formatPeriodRange,
  isDayKey,
} from "@/components/dining/caterer/meal-records/mealRecordsHelpers";
import DaySheet from "@/components/dining/daily/DaySheet";
import CheckOnList from "@/components/dining/daily/CheckOnList";
import {
  buildDaySheetCsv,
  CHECK_ON_DAYS,
  DEFAULT_CHECK_ON_DAYS,
  fileTag,
} from "@/components/dining/daily/dailyMealsHelpers";
import "@/components/dining/caterer/meal-records/MealRecords.css";
import "@/components/dining/daily/DailyMeals.css";

const POLL_MS = 60_000;

const Stat = ({ label, value, note, tone }) => (
  <div className="dm-stat" data-tone={tone}>
    <span className="dm-stat__label">{label}</span>
    <span className="dm-stat__value">{value}</span>
    {note && <span className="dm-stat__note">{note}</span>}
  </div>
);

/**
 * Daily meals, for Admin and the Dining Office: one day across every caterer —
 * who was assigned, who was away, who ate each meal and who did not — and the
 * students who have not eaten anywhere for days. `home` is the portal base path.
 */
const DailyMealsPage = ({ home }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  // Same caterer list and colours as Meal records and Live feed.
  const optionsQuery = useQuery({
    queryKey: queryKeys.diningOversight.mealRecordOptions({}),
    queryFn: () => diningOversightApi.getMealRecordOptions(),
    refetchOnWindowFocus: false,
  });
  const today = optionsQuery.data?.today || localTodayKey();
  const caterers = useMemo(() => {
    const serving = new Set(
      (optionsQuery.data?.periods || []).flatMap(
        (item) => item.catererIds || [],
      ),
    );
    return (optionsQuery.data?.caterers || []).filter(
      (item) => !item.isArchived || serving.has(item.id),
    );
  }, [optionsQuery.data]);
  const palette = useMemo(() => buildCatererPalette(caterers), [caterers]);

  const dateParam = searchParams.get("date");
  const date = isDayKey(dateParam) ? dateParam : today;
  const catererParam = searchParams.get("caterer") || "";
  const catererId = caterers.some((item) => item.id === catererParam)
    ? catererParam
    : "";
  const catererName =
    caterers.find((item) => item.id === catererId)?.name || "";
  const daysParam = Number(searchParams.get("days"));
  const days = CHECK_ON_DAYS.includes(daysParam)
    ? daysParam
    : DEFAULT_CHECK_ON_DAYS;
  const periodParam = searchParams.get("period") || "";

  const params = {
    date,
    days: String(days),
    ...(catererId ? { catererId } : {}),
    ...(periodParam ? { periodId: periodParam } : {}),
  };
  const reportQuery = useQuery({
    queryKey: queryKeys.diningOversight.dailyReport(params),
    queryFn: () => diningOversightApi.getDailyReport(params),
    enabled: optionsQuery.isSuccess,
    placeholderData: keepPreviousData,
    // Today's numbers move while meals are served.
    refetchInterval: date === today ? POLL_MS : false,
  });
  const report = reportQuery.data;
  const stale =
    Boolean(report) && (report.date !== date || reportQuery.isPlaceholderData);

  if (optionsQuery.isPending)
    return <LoadingState message="Loading daily meals..." />;

  const exportSheet = () =>
    downloadCsv(
      `daily-meals${fileTag(catererName)}-${date}.csv`,
      buildDaySheetCsv(report),
    );

  const header = (
    <PageHeader
      title="Daily meals"
      subtitle={`${catererName || "All caterers"} · ${formatDayLong(date)}`}
    >
      {caterers.length > 0 && (
        <Select
          size="small"
          value={catererId}
          onChange={(event) => setParam("caterer", event.target.value)}
          options={[
            { value: "", label: "All caterers" },
            ...caterers.map((item) => ({ value: item.id, label: item.name })),
          ]}
          aria-label="Caterer"
        />
      )}
      {report?.periods?.length > 1 && (
        <Select
          size="small"
          value={report.period?.id || ""}
          onChange={(event) => setParam("period", event.target.value)}
          options={report.periods.map((item) => ({
            value: item.id,
            label: formatPeriodRange(item.startDate, item.endDate),
          }))}
          aria-label="Dining period"
        />
      )}
      <Button
        variant="secondary"
        size="sm"
        onClick={exportSheet}
        disabled={!report?.caterers?.length || stale}
      >
        <Download size={16} /> Export day
      </Button>
    </PageHeader>
  );

  if (optionsQuery.isError) {
    return (
      <Page>
        {header}
        <Page.Body>
          <ErrorState
            message={getErrorMessage(
              optionsQuery.error,
              "Unable to load the caterers.",
            )}
            onRetry={() => optionsQuery.refetch()}
          />
        </Page.Body>
      </Page>
    );
  }

  const totals = report?.totals;
  const allEnded =
    Boolean(report?.mealSlots?.length) &&
    report.mealSlots.every((slot) => slot.state === "ended");
  const future = date > today;

  return (
    <Page>
      {header}
      <Page.Body>
        <div className="dm-page">
          <div className="dm-daybar">
            <div className="dm-daybar__nav">
              <IconButton
                size="small"
                variant="outline"
                ariaLabel="Previous day"
                onClick={() => setParam("date", addDays(date, -1))}
                icon={<ChevronLeft size={16} />}
              />
              <span className="dm-daybar__day">{relativeDay(date, today)}</span>
              <IconButton
                size="small"
                variant="outline"
                ariaLabel="Next day"
                onClick={() => setParam("date", addDays(date, 1))}
                icon={<ChevronRight size={16} />}
              />
              <div className="dm-daybar__picker">
                <DatePicker
                  size="small"
                  value={date}
                  onChange={(event) =>
                    event?.target?.value && setParam("date", event.target.value)
                  }
                  aria-label="Pick a day"
                />
              </div>
              {date !== today && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setParam("date", "")}
                >
                  Back to today
                </Button>
              )}
            </div>
            <div className="dm-daybar__links">
              <Link to={`${home}/meal-records`} className="dm-link">
                <ClipboardList size={15} aria-hidden="true" /> Meal records
              </Link>
              <Link
                to={home === "/admin" ? "/admin/dining-live" : `${home}/live`}
                className="dm-link"
              >
                <Radio size={15} aria-hidden="true" /> Live feed
              </Link>
            </div>
          </div>

          {reportQuery.isError && !report ? (
            <ErrorState
              message={getErrorMessage(
                reportQuery.error,
                "Unable to load this day.",
              )}
              onRetry={() => reportQuery.refetch()}
            />
          ) : !report ? (
            <>
              <Skeleton variant="rounded" height={96} />
              <Skeleton variant="rounded" height={220} />
            </>
          ) : !report.period ? (
            <EmptyState
              icon={CalendarX2}
              title={
                catererName
                  ? `${catererName} is not serving on this day`
                  : "No dining period on this day"
              }
              message="Pick another day, or set up a dining period that covers it."
            />
          ) : (
            <div className="dm-stack" data-stale={stale || undefined}>
              <div className="dm-stats">
                <Stat
                  label="Assigned"
                  value={totals.allocatedCount}
                  note={formatPeriodRange(
                    report.period.startDate,
                    report.period.endDate,
                  )}
                />
                <Stat
                  label="Away on rebate"
                  value={totals.onRebateCount}
                  note={`${percent(totals.onRebateCount, totals.allocatedCount)}% of assigned`}
                />
                <Stat
                  label={future ? "Expected to eat" : "Should eat"}
                  value={totals.expectedCount}
                  note={future ? "Cook for this many" : "Assigned minus away"}
                  tone="primary"
                />
                {future ? (
                  <Stat
                    label="Meals"
                    value={report.mealSlots.length}
                    note="None served yet"
                  />
                ) : allEnded ? (
                  <Stat
                    label="Ate nothing all day"
                    value={totals.ateNothingCount}
                    note={`${percent(totals.ateAnyCount, totals.expectedCount)}% ate at least once`}
                    tone={totals.ateNothingCount > 0 ? "warning" : "success"}
                  />
                ) : (
                  <Stat
                    label="Ate so far"
                    value={totals.ateAnyCount}
                    note={`${percent(totals.ateAnyCount, totals.expectedCount)}% of those who should eat`}
                    tone="success"
                  />
                )}
              </div>

              {report.mealSlots.length === 0 ? (
                <EmptyState
                  icon={CalendarX2}
                  title="This period has no meals"
                  message="Set up meal times for the period to see who ate."
                />
              ) : report.caterers.length === 0 ? (
                <EmptyState
                  icon={CalendarX2}
                  title="No caterers in this period"
                  message="Add caterers to the dining period to see their numbers."
                />
              ) : (
                <DaySheet
                  report={report}
                  palette={palette}
                  onPick={
                    catererId ? undefined : (id) => setParam("caterer", id)
                  }
                />
              )}

              {catererId && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="dm-showall"
                  onClick={() => setParam("caterer", "")}
                >
                  Show all caterers
                </Button>
              )}

              <CheckOnList
                checkOn={report.checkOn}
                days={days}
                onDays={(value) =>
                  setParam(
                    "days",
                    value === DEFAULT_CHECK_ON_DAYS ? "" : String(value),
                  )
                }
                palette={palette}
                showCaterer={!catererId}
                catererName={catererName}
                loading={reportQuery.isFetching && stale}
              />
            </div>
          )}
        </div>
      </Page.Body>
    </Page>
  );
};

export default DailyMealsPage;
