import { useQuery } from "@tanstack/react-query"
import { Drawer, EmptyState, ErrorState, Skeleton, Tag, Text } from "hzero"
import { CalendarOff } from "lucide-react"
import { catererApi } from "@/service"
import { queryKeys } from "@/lib/query"
import { formatDayLong, pluralize } from "../catererHelpers"
import RebateStudent from "./RebateStudent"
import { rangeLabel, typeLabel } from "./rebateHelpers"
import "./Rebates.css"

const SECTIONS = [
  { key: "onRebate", title: "Away" },
  { key: "starting", title: "Leaving this day" },
  { key: "returning", title: "Back this day" },
  { key: "pending", title: "Pending requests" },
]

const Item = ({ entry }) => (
  <div className="rd-item">
    <RebateStudent student={entry.student} />
    <div className="rd-item-meta">
      <Text size="sm" color="body">{rangeLabel(entry.rebate)}, {pluralize(entry.rebate.dayCount, "day")}</Text>
      <Tag size="sm">{typeLabel(entry.rebate.type)}</Tag>
    </div>
  </div>
)

const DayBody = ({ data }) => {
  const sections = SECTIONS.map((section) => ({ ...section, entries: data[section.key] || [] })).filter((s) => s.entries.length > 0)
  if (sections.length === 0) {
    return <EmptyState icon={CalendarOff} title="Nothing on this day" message="No students are away, leaving, returning or waiting for approval." />
  }
  return sections.map((section) => (
    <section className="rd-section" key={section.key} aria-label={section.title}>
      <div className="rd-section-head">
        <Text weight="semibold" color="heading">{section.title}</Text>
        <Text size="sm" color="muted">{section.entries.length}</Text>
      </div>
      {section.entries.map((entry) => <Item key={`${section.key}-${entry.rebate.id}`} entry={entry} />)}
    </section>
  ))
}

/** Names behind one day's numbers. Fetches on open, keyed by date. */
const RebateDayDrawer = ({ date, onClose }) => {
  const query = useQuery({
    queryKey: queryKeys.caterer.rebateDay(date),
    queryFn: () => catererApi.getRebateDay(date),
    enabled: Boolean(date),
  })
  const data = query.data

  const title = (
    <span className="rd-title">
      <span>{date ? formatDayLong(date) : ""}</span>
      {data?.periodId && <span className="rd-title-sub">Cook for {data.expectedCount} of {data.allocatedCount}</span>}
      {data && !data.periodId && <span className="rd-title-sub">No service</span>}
    </span>
  )

  let body
  if (query.isPending) body = <Skeleton variant="text" lines={6} />
  else if (query.isError) body = <ErrorState message="Could not load this day." onRetry={() => query.refetch()} />
  else body = <DayBody data={data} />

  return (
    <Drawer isOpen={Boolean(date)} onClose={onClose} title={title} placement="right" size="medium">
      {body}
    </Drawer>
  )
}

export default RebateDayDrawer
