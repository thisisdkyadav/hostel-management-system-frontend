import { useMemo } from "react"
import { EmptyState, ErrorState, Panel, Progress, Skeleton, Text } from "hzero"
import { UserCheck } from "lucide-react"
import RebateStudent from "./RebateStudent"
import { backLabel, backOnKey } from "./rebateHelpers"
import "./Rebates.css"

const AwayTodayPanel = ({ data, today, loading, error, onRetry }) => {
  // Soonest back first; the roll number keeps the order stable.
  const rows = useMemo(() => {
    const list = [...(data?.onRebate || [])]
    return list.sort((a, b) => {
      const byBack = backOnKey(a.rebate).localeCompare(backOnKey(b.rebate))
      return byBack || String(a.student?.rollNumber).localeCompare(String(b.student?.rollNumber))
    })
  }, [data])

  let body
  if (loading) body = <Skeleton variant="text" lines={4} />
  else if (error) body = <ErrorState message="Could not load who is away today." onRetry={onRetry} />
  else if (rows.length === 0) body = <EmptyState icon={UserCheck} title="Nobody is away today" message="Everyone allocated to you is expected to eat." />
  else {
    body = rows.map(({ rebate, student, dayNumber, dayCount }) => (
      <div className="reb-away-row" key={rebate.id}>
        <RebateStudent student={student} />
        <div className="reb-away-meta">
          <Text size="sm" color="body">{backLabel(rebate, today)}</Text>
          <div className="reb-progress-line">
            <Progress value={dayNumber} max={dayCount} size="sm" color="warning" aria-label={`Day ${dayNumber} of ${dayCount}`} />
            <Text size="xs" color="muted" style={{ whiteSpace: "nowrap" }}>day {dayNumber} of {dayCount}</Text>
          </div>
        </div>
      </div>
    ))
  }

  return (
    <Panel title="Away today" subtitle="Soonest back first" accent="warning" count={loading || error ? undefined : rows.length} height="lg">
      <Panel.Body scroll>{body}</Panel.Body>
    </Panel>
  )
}

export default AwayTodayPanel
