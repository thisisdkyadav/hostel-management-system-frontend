import { useState } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { DataTable, ErrorState, FilterTabs, Pagination, SearchInput, StatusBadge, Tag, Text } from "hzero"
import { catererApi } from "@/service"
import { queryKeys } from "@/lib/query"
import { REBATE_STATUS_TONES, capitalize, formatRange, pluralize } from "../catererHelpers"
import RebateStudent from "./RebateStudent"
import { REQUESTS_PAGE_SIZE, rebateEnd, rebateStart, typeLabel, useDebouncedValue } from "./rebateHelpers"
import "./Rebates.css"

const STATUSES = ["all", "approved", "pending", "rejected"]

const columns = [
  { key: "student", header: "Student", render: (row) => <RebateStudent student={{ ...row.student, rollNumber: row.student?.rollNumber || row.rollNumber }} /> },
  { key: "dates", header: "Dates", render: (row) => <Text size="sm" style={{ whiteSpace: "nowrap" }}>{formatRange(rebateStart(row), rebateEnd(row))}</Text> },
  { key: "days", header: "Days", render: (row) => <Text size="sm">{row.dayCount}</Text> },
  { key: "type", header: "Type", render: (row) => <Tag size="sm">{typeLabel(row.type)}</Tag> },
  {
    key: "status",
    header: "Status",
    render: (row) => <StatusBadge status={capitalize(row.status)} tone={REBATE_STATUS_TONES[row.status] || "primary"} />,
  },
  {
    key: "reason",
    header: "Reason",
    render: (row) => (row.reason ? <span className="reb-reason" title={row.reason}>{row.reason}</span> : <Text size="sm" color="muted">-</Text>),
  },
]

/** Every request for this caterer's periods, server-paginated. */
const RebateRequestsTable = () => {
  const [status, setStatus] = useState("all")
  const [searchInput, setSearchInput] = useState("")
  const search = useDebouncedValue(searchInput.trim(), 300)
  // Page is remembered with the filters it was chosen under, so changing
  // status or search falls back to page 1 without an effect.
  const filterKey = `${status}|${search}`
  const [pageState, setPageState] = useState({ key: filterKey, page: 1 })
  const page = pageState.key === filterKey ? pageState.page : 1

  const params = { status, page, limit: REQUESTS_PAGE_SIZE, ...(search ? { search } : {}) }
  const query = useQuery({
    queryKey: queryKeys.caterer.rebates(params),
    queryFn: () => catererApi.getRebates(params),
    placeholderData: keepPreviousData,
  })

  const counts = query.data?.counts
  const tabs = STATUSES.map((value) => ({
    value,
    label: capitalize(value),
    ...(counts ? { count: counts[value] ?? 0 } : {}),
  }))
  const totalPages = query.data?.pagination?.totalPages || 1
  const total = query.data?.pagination?.total ?? 0

  return (
    <div>
      <div className="reb-toolbar">
        <FilterTabs tabs={tabs} activeTab={status} setActiveTab={setStatus} size="sm" />
        <SearchInput
          className="reb-search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search name or roll number"
        />
      </div>

      {query.isError && !query.data ? (
        <ErrorState message="Could not load rebate requests." onRetry={() => query.refetch()} />
      ) : (
        <>
          <DataTable
            data={query.data?.rebates || []}
            columns={columns}
            loading={query.isPending}
            getRowId={(row) => row.id}
            emptyTitle="No requests found"
            emptyMessage={search || status !== "all" ? "Try another status or search." : "No rebate requests yet."}
          />
          {totalPages > 1 && (
            <>
              <Text size="sm" color="muted" style={{ margin: "var(--spacing-3) 0 0" }}>{pluralize(total, "request")}</Text>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                paginate={(next) => setPageState({ key: filterKey, page: next })}
              />
            </>
          )}
        </>
      )}
    </div>
  )
}

export default RebateRequestsTable
