import { useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  DataTable,
  EmptyState,
  FilterTabs,
  SearchInput,
  Select,
  StatusBadge,
} from "hzero";
import { Download, HeartPulse, SmilePlus } from "lucide-react";
import { getMediaUrl } from "@/utils/mediaUtils";
import { describeRoom, formatRange } from "../caterer/catererHelpers";
import { catererColor } from "../caterer/diningScope";
import { downloadCsv } from "../caterer/meal-records/mealRecordsHelpers";
import {
  buildCheckOnCsv,
  CHECK_ON_DAYS,
  daysTone,
  fileTag,
  lastMealLabel,
} from "./dailyMealsHelpers";

const PAGE_SIZE = 20;

const baseColumns = [
  {
    key: "sortName",
    header: "Student",
    render: (row) => (
      <div className="mr-student">
        <Avatar
          src={getMediaUrl(row.student.profileImage)}
          name={row.student.name}
          alt=""
          size="small"
        />
        <div className="mr-student__text">
          <span className="mr-student__name">
            {row.student.name || "Unnamed student"}
          </span>
          <span className="mr-student__roll">
            {row.student.rollNumber || "No roll number"}
          </span>
        </div>
      </div>
    ),
  },
  {
    key: "room",
    header: "Room",
    render: (row) => row.room || <span className="dm-muted">-</span>,
  },
  {
    key: "lastMeal",
    header: "Last meal",
    render: (row) => (
      <span className={row.lastMealAt ? undefined : "dm-muted"}>
        {row.lastMeal}
      </span>
    ),
  },
  {
    key: "daysWithoutMeal",
    header: "Without a meal",
    render: (row) => (
      <StatusBadge tone={daysTone(row.daysWithoutMeal)} showDot={false}>
        {row.daysWithoutMeal} days
      </StatusBadge>
    ),
  },
];

const catererColumn = (palette) => ({
  key: "catererName",
  header: "Caterer",
  render: (row) =>
    row.caterer ? (
      <span
        className="mr-caterer"
        style={{ "--kitchen": catererColor(palette, row.caterer.id) }}
      >
        <span className="mr-caterer__name">{row.caterer.name}</span>
      </span>
    ) : (
      <span className="dm-muted">-</span>
    ),
});

/**
 * Assigned students with no rebate and no meal anywhere for the last few days.
 * Usually: away without applying for a rebate, unwell, or not being recognised
 * at the counter. Each one is worth a call.
 */
const CheckOnList = ({
  checkOn,
  days,
  onDays,
  palette,
  showCaterer,
  catererName,
  loading,
}) => {
  const [hostel, setHostel] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const rows = useMemo(
    () =>
      (checkOn?.students || []).map((item) => ({
        ...item,
        id: item.student.id,
        sortName: (item.student.name || "").toLowerCase(),
        room: describeRoom(item.student),
        lastMeal: lastMealLabel(item),
        catererName: item.caterer?.name || "",
      })),
    [checkOn],
  );
  const hostels = useMemo(
    () =>
      [
        ...new Set(rows.map((row) => row.student.hostel?.name).filter(Boolean)),
      ].sort((a, b) => a.localeCompare(b)),
    [rows],
  );
  const hostelFilter = hostels.includes(hostel) ? hostel : "";
  const needle = query.trim().toLowerCase();
  const visible = rows.filter(
    (row) =>
      (!hostelFilter || row.student.hostel?.name === hostelFilter) &&
      (!needle ||
        row.sortName.includes(needle) ||
        String(row.student.rollNumber || "")
          .toLowerCase()
          .includes(needle)),
  );
  const columns = showCaterer
    ? [baseColumns[0], catererColumn(palette), ...baseColumns.slice(1)]
    : baseColumns;
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));

  const exportCsv = () =>
    downloadCsv(
      `students-to-check-on${fileTag(catererName)}${fileTag(hostelFilter)}-${checkOn.to}.csv`,
      buildCheckOnCsv(visible),
    );

  const tabs = CHECK_ON_DAYS.map((value) => ({
    value: String(value),
    label: `${value} days`,
  }));
  const span = checkOn?.available ? formatRange(checkOn.from, checkOn.to) : "";

  let empty;
  if (checkOn && !checkOn.available) {
    empty = {
      icon: HeartPulse,
      title: `This period is not ${days} days old yet`,
      message: "Pick fewer days, or check back later in the period.",
    };
  } else if (needle || hostelFilter) {
    empty = {
      icon: HeartPulse,
      title: "No student matches",
      message: "Nobody on this list matches the search or hostel.",
    };
  } else {
    empty = {
      icon: SmilePlus,
      title: "Everyone is eating",
      message: `Every student who is not on rebate ate at least one meal in the last ${days} days.`,
    };
  }

  return (
    <Card className="dm-checkon">
      <div className="dm-checkon__head">
        <div>
          <h2 className="dm-section-title">
            Students to check on
            {rows.length > 0 && (
              <span className="dm-checkon__count">{rows.length}</span>
            )}
          </h2>
          <p className="dm-section-note">
            Not on rebate, but no meal at any caterer for {days} days
            {span ? ` (${span})` : ""}. They may be away without a rebate,
            unwell, or not being recognised at the counter.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={exportCsv}
          disabled={!visible.length}
        >
          <Download size={16} /> Export list
        </Button>
      </div>
      <div className="mr-roster__toolbar">
        <FilterTabs
          tabs={tabs}
          activeTab={String(days)}
          setActiveTab={(value) => {
            onDays(Number(value));
            setPage(1);
          }}
          size="sm"
        />
        <div className="dm-checkon__filters">
          {hostels.length > 1 && (
            <div className="dm-checkon__hostel">
              <Select
                size="small"
                value={hostelFilter}
                onChange={(event) => {
                  setHostel(event.target.value);
                  setPage(1);
                }}
                options={[
                  { value: "", label: "All hostels" },
                  ...hostels.map((name) => ({ value: name, label: name })),
                ]}
                aria-label="Hostel"
              />
            </div>
          )}
          <SearchInput
            className="mr-roster__search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search name or roll number"
            size="sm"
            aria-label="Search students by name or roll number"
          />
        </div>
      </div>
      <DataTable
        data={visible}
        columns={columns}
        sortable
        pagination
        pageSize={PAGE_SIZE}
        currentPage={Math.min(page, totalPages)}
        onPageChange={setPage}
        loading={loading}
        getRowId={(row) => row.id}
        emptyState={
          <EmptyState
            icon={empty.icon}
            size="sm"
            title={empty.title}
            message={empty.message}
          />
        }
      />
    </Card>
  );
};

export default CheckOnList;
