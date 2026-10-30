import { useMemo, useState } from "react"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Alert, Avatar, Button, DataTable, Drawer, ErrorState, FilterTabs, Pagination, SearchInput, StatTile, StatusBadge, Text, useToast } from "hzero"
import { Download, Upload } from "lucide-react"
import { queryKeys } from "@/lib/query"
import { diningTagsApi } from "@/service"
import { getMediaUrl } from "@/utils/mediaUtils"
import { getErrorMessage } from "../caterer/catererHelpers"
import { useDebouncedValue } from "../caterer/rebates/rebateHelpers"
import { formatDateTime } from "../diningPeriodHelpers"
import TagCsvModal from "./TagCsvModal"
import {
  AUDIENCE_CUSTOM,
  PAGE_SIZE,
  SOURCE_META,
  answerLabel,
  answerTone,
  buildRosterCsv,
  defaultLabel,
  downloadCsv,
  hostelName,
  periodRange,
} from "./tagHelpers"
import "./Tags.css"

const EXPORT_PAGE = 200

/** Standalone tags without a custom list only know the students who have answered. */
const listsUnanswered = (tag) => tag.kind === "period" || (tag.form?.enabled && tag.form?.audience === AUDIENCE_CUSTOM)

const DrawerBody = ({ tag, canEdit }) => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [searchInput, setSearchInput] = useState("")
  const search = useDebouncedValue(searchInput.trim(), 300)
  const [value, setValue] = useState("all")
  const [uploading, setUploading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [pendingId, setPendingId] = useState("")

  const showUnanswered = listsUnanswered(tag)
  const activeValue = value === "unanswered" && !showUnanswered ? "all" : value

  // Page is remembered with the filters it was chosen under, so changing a filter returns to page 1.
  const filterKey = `${search}|${activeValue}`
  const [pageState, setPageState] = useState({ key: filterKey, page: 1 })
  const page = pageState.key === filterKey ? pageState.page : 1

  const params = { page, limit: PAGE_SIZE, ...(search ? { search } : {}), ...(activeValue !== "all" ? { value: activeValue } : {}) }
  const query = useQuery({
    queryKey: queryKeys.diningTags.students(tag.id, params),
    queryFn: () => diningTagsApi.getTagStudents(tag.id, params),
    placeholderData: keepPreviousData,
  })

  const items = query.data?.items || []
  const total = query.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const counts = query.data?.counts || {
    yes: tag.counts?.yes ?? 0,
    no: tag.counts?.no ?? 0,
    unanswered: undefined,
    total: undefined,
  }
  const filtering = Boolean(search || activeValue !== "all")

  const setAnswer = useMutation({
    mutationFn: ({ row, next }) => diningTagsApi.setStudentValue(tag.id, row.studentUserId, next),
    onMutate: ({ row }) => setPendingId(row.studentUserId),
    onSuccess: async (_saved, { row, next }) => {
      toast.success(`${row.name || row.rollNumber}: ${next === null ? "answer cleared" : next ? "Yes" : "No"}`)
      await queryClient.invalidateQueries({ queryKey: queryKeys.diningTags.all })
    },
    onError: (error) => toast.error(getErrorMessage(error, "Unable to save the answer.")),
    onSettled: () => setPendingId(""),
  })

  const exportCsv = async () => {
    setExporting(true)
    try {
      const rows = []
      for (let nextPage = 1; nextPage <= 100; nextPage += 1) {
        const batch = await diningTagsApi.getTagStudents(tag.id, {
          page: nextPage,
          limit: EXPORT_PAGE,
          ...(search ? { search } : {}),
          ...(activeValue !== "all" ? { value: activeValue } : {}),
        })
        rows.push(...(batch?.items || []))
        if (rows.length >= (batch?.total ?? 0) || !(batch?.items || []).length) break
      }
      const slug = tag.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "tag"
      downloadCsv(`dining-tag-${slug}.csv`, buildRosterCsv(rows))
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to export the list."))
    } finally {
      setExporting(false)
    }
  }

  const columns = useMemo(
    () => [
      {
        key: "name",
        header: "Student",
        render: (row) => (
          <span className="tg-student">
            <Avatar src={getMediaUrl(row.profileImage)} name={row.name} alt="" size="small" />
            <span className="tg-student__text">
              <span className="tg-student__name">{row.name || "Unnamed student"}</span>
              <span className="tg-student__roll">{row.rollNumber}</span>
            </span>
          </span>
        ),
      },
      { key: "hostel", header: "Hostel", className: "tg-col-wide", render: (row) => hostelName(row) || <span className="tg-muted">-</span> },
      {
        key: "value",
        header: "Answer",
        render: (row) => <StatusBadge tone={answerTone(row.value)} showDot={false}>{answerLabel(row.value)}</StatusBadge>,
      },
      {
        key: "effective",
        header: "Effective",
        className: "tg-col-wide",
        render: (row) => <StatusBadge tone={answerTone(row.effective)} showDot={false}>{answerLabel(row.effective)}</StatusBadge>,
      },
      {
        key: "source",
        header: "Source",
        className: "tg-col-wide",
        render: (row) => {
          const meta = SOURCE_META[row.source]
          return meta && row.value !== null && row.value !== undefined ? (
            <StatusBadge tone={meta.tone} showDot={false}>{meta.label}</StatusBadge>
          ) : (
            <span className="tg-muted">-</span>
          )
        },
      },
      {
        key: "updatedAt",
        header: "Updated",
        className: "tg-col-wide",
        render: (row) => (row.updatedAt ? formatDateTime(row.updatedAt) : <span className="tg-muted">-</span>),
      },
      ...(canEdit
        ? [
            {
              key: "actions",
              header: "Set",
              align: "right",
              render: (row) => {
                const busy = pendingId === row.studentUserId
                return (
                  <span className="tg-setter" role="group" aria-label={`Set answer for ${row.name || row.rollNumber}`}>
                    <Button size="sm" variant={row.value === true ? "primary" : "secondary"} disabled={busy} onClick={() => setAnswer.mutate({ row, next: true })}>
                      Yes
                    </Button>
                    <Button size="sm" variant={row.value === false ? "primary" : "secondary"} disabled={busy} onClick={() => setAnswer.mutate({ row, next: false })}>
                      No
                    </Button>
                    <Button size="sm" variant="ghost" disabled={busy || row.value === null || row.value === undefined} onClick={() => setAnswer.mutate({ row, next: null })}>
                      Clear
                    </Button>
                  </span>
                )
              },
            },
          ]
        : []),
    ],
    [canEdit, pendingId, setAnswer]
  )

  const tabs = [
    { value: "all", label: "All" },
    { value: "yes", label: "Yes", ...(counts.yes !== undefined ? { count: counts.yes } : {}) },
    { value: "no", label: "No", ...(counts.no !== undefined ? { count: counts.no } : {}) },
    ...(showUnanswered ? [{ value: "unanswered", label: "Unanswered", ...(counts.unanswered !== undefined ? { count: counts.unanswered } : {}) }] : []),
  ]

  return (
    <div className="tg-drawer">
      <header className="tg-drawer__hero">
        <div className="tg-drawer__badges">
          <StatusBadge tone={tag.kind === "period" ? "info" : "primary"} showDot={false}>{tag.kind === "period" ? "Allocation tag" : "Standalone"}</StatusBadge>
          {tag.isArchived && <StatusBadge tone="neutral" showDot={false}>Archived</StatusBadge>}
          <span className="tg-muted">{periodRange(tag.startDate, tag.endDate)}</span>
          <span className="tg-muted">Default: {defaultLabel(tag.defaultValue)}</span>
        </div>
        {tag.question && <p className="tg-drawer__question">{tag.question}</p>}
        {tag.description && <p className="tg-muted">{tag.description}</p>}
      </header>

      <section className="tg-kpis" aria-label="Answer counts">
        <StatTile label="Yes" value={counts.yes ?? 0} tone="success" />
        <StatTile label="No" value={counts.no ?? 0} tone="danger" />
        {showUnanswered && counts.unanswered !== undefined && <StatTile label="Unanswered" value={counts.unanswered} tone="warning" />}
        {counts.total !== undefined && <StatTile label="Students" value={counts.total} tone="primary" />}
      </section>

      {!showUnanswered && (
        <Alert type="info" icon>
          Only students with an answer are listed. Upload a CSV or answer on a student&apos;s behalf to add them.
        </Alert>
      )}

      <div className="tg-toolbar">
        <SearchInput
          className="tg-toolbar__search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search name or roll number"
          size="sm"
          aria-label="Search students"
        />
        <div className="tg-toolbar__actions">
          <Button variant="secondary" size="sm" onClick={exportCsv} loading={exporting} disabled={!total}>
            <Download size={16} /> Download CSV
          </Button>
          {canEdit && (
            <Button size="sm" onClick={() => setUploading(true)}>
              <Upload size={16} /> Upload CSV
            </Button>
          )}
        </div>
      </div>

      <div className="tg-quick">
        <FilterTabs tabs={tabs} activeTab={activeValue} setActiveTab={setValue} size="sm" />
      </div>

      {query.isError && !query.data ? (
        <ErrorState message={getErrorMessage(query.error, "Unable to load the students.")} onRetry={() => query.refetch()} />
      ) : (
        <div className="tg-table" data-stale={query.isPlaceholderData || undefined}>
          <DataTable
            data={items}
            columns={columns}
            loading={query.isPending}
            getRowId={(row) => row.studentUserId}
            emptyTitle={filtering ? "No students match" : "No students yet"}
            emptyMessage={filtering ? "Try another search or filter." : "Nobody has an answer for this tag yet."}
          />
          {totalPages > 1 && (
            <>
              <Text size="sm" color="muted" style={{ margin: "var(--spacing-3) 0 0" }}>
                {total} student{total === 1 ? "" : "s"}
              </Text>
              <Pagination currentPage={page} totalPages={totalPages} paginate={(next) => setPageState({ key: filterKey, page: next })} />
            </>
          )}
        </div>
      )}

      <TagCsvModal isOpen={uploading} tag={tag} onClose={() => setUploading(false)} />
    </div>
  )
}

/** One tag's answers: counts, a searchable roster, per-student Yes / No / Clear, and CSV in and out. */
const TagDrawer = ({ tag, onClose }) => (
  <Drawer isOpen={Boolean(tag)} onClose={onClose} title={tag?.name || "Tag"} size="xl">
    {tag && <DrawerBody key={tag.id} tag={tag} canEdit={!tag.isArchived} />}
  </Drawer>
)

export default TagDrawer
