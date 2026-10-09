import { Radio } from "lucide-react"
import { Button, Skeleton, ToggleButtonGroup } from "hzero"
import ScanRow from "./ScanRow"
import { MAX_ENTRIES } from "./liveHelpers"

const FILTERS = (issues) => [
  { value: "all", label: "All" },
  { value: "issues", label: issues > 0 ? `Issues ${issues}` : "Issues" },
]

const Waiting = ({ filter, idle }) => {
  if (filter === "issues") {
    return (
      <div className="lf-empty">
        <p className="lf-empty-title">No issues</p>
        <p className="lf-empty-text">Scans that need a look will show up here.</p>
      </div>
    )
  }
  return (
    <div className="lf-empty">
      <span className="lf-empty-orb" aria-hidden="true"><Radio size={28} /></span>
      <p className="lf-empty-title">{idle ? "No scans for this meal" : "Waiting for the first scan"}</p>
      <p className="lf-empty-text">{idle ? "Nobody was checked in." : "Students will appear here as they check in."}</p>
    </div>
  )
}

/** The live scroll of scans, newest on top. */
const ScanStream = ({ entries, issueCount, todayCount, filter, onFilter, nowMs, previewId, onPreview, caption, idle, loading, error, onRetry }) => {
  const shown = filter === "issues" ? entries.filter((entry) => entry.status !== "verified") : entries
  const count = todayCount > MAX_ENTRIES ? todayCount : Math.max(todayCount, entries.length)

  return (
    <section className="lf-panel lf-stream" data-idle={idle || undefined} aria-label="Live scans">
      <header className="lf-stream-head">
        <div className="lf-stream-title">
          <h2 className="lf-h2">Live scans</h2>
          {caption && <p className="lf-stream-caption">{caption}</p>}
        </div>
        <div className="lf-stream-tools">
          <span className="lf-count">{count} today</span>
          <ToggleButtonGroup options={FILTERS(issueCount)} value={filter} onChange={onFilter} size="small" shape="pill" hideLabelsOnMobile={false} />
        </div>
      </header>

      {loading ? (
        <div className="lf-stream-list" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} variant="rounded" height="4.5rem" />)}
        </div>
      ) : error ? (
        <div className="lf-empty" role="alert">
          <p className="lf-empty-title">Could not load the scans</p>
          <Button variant="secondary" onClick={onRetry}>Try again</Button>
        </div>
      ) : shown.length === 0 ? (
        <Waiting filter={filter} idle={idle} />
      ) : (
        <ul className="lf-stream-list" aria-live={idle ? "off" : "polite"}>
          {shown.map((entry) => (
            <ScanRow key={entry.id} entry={entry} nowMs={nowMs} previewing={entry.id === previewId} onPreview={onPreview} />
          ))}
        </ul>
      )}
    </section>
  )
}

export default ScanStream
