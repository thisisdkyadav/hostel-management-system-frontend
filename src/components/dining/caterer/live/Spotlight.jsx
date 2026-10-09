import { useState } from "react"
import { Check, Keyboard, ScanFace, TriangleAlert } from "lucide-react"
import { SCAN_SOURCE_LABELS } from "../catererHelpers"
import ScanPhoto from "./ScanPhoto"
import { exactTime, isIssue, issueLabel, issueTone, relativeTime } from "./liveHelpers"

const Card = ({ entry, nowMs, previewing, layer, idle }) => {
  const issue = isIssue(entry)
  const tone = issue ? issueTone(entry) : "ok"
  const SourceIcon = entry.source === "manual" ? Keyboard : ScanFace
  return (
    <div className="lf-spot-card" data-layer={layer} data-tone={tone} aria-hidden={layer === "out" || undefined}>
      <div className="lf-spot-photo">
        <ScanPhoto photo={entry.photo} name={entry.name} alt={`${entry.name} photo`} />
      </div>
      <div className="lf-spot-info">
        <span className="lf-spot-tag" data-previewing={previewing || undefined}>
          {previewing ? "Previewing" : idle ? "Last scan" : "Latest scan"}
        </span>
        <h2 className="lf-spot-name">{entry.name}</h2>
        <p className="lf-spot-ids">
          <span>{entry.rollNumber}</span>
          {entry.room && <span className="lf-spot-room">{entry.room}</span>}
        </p>
        <p className="lf-spot-status" data-tone={tone}>
          {issue ? <TriangleAlert size={20} aria-hidden="true" /> : <Check size={20} aria-hidden="true" />}
          <span>{issue ? issueLabel(entry) : "Verified"}</span>
        </p>
        {issue && entry.message && <p className="lf-spot-message">{entry.message}</p>}
        <p className="lf-spot-when">
          <SourceIcon size={16} aria-hidden="true" />
          <span>{SCAN_SOURCE_LABELS[entry.source] || "Scanned"}</span>
          <time dateTime={entry.scannedAt} title={exactTime(entry.scannedAt)}>
            {exactTime(entry.scannedAt)}, {relativeTime(entry.scannedAt, nowMs)}
          </time>
        </p>
      </div>
    </div>
  )
}

/** The big card: the student who just scanned, or whoever the caterer is pointing at in the stream. */
const Spotlight = ({ entry, previewing, nowMs, idle }) => {
  // Keep the card that was on show so it can fade out while the new one fades in.
  const [shown, setShown] = useState(entry)
  const [leaving, setLeaving] = useState(null)
  if ((entry?.id ?? null) !== (shown?.id ?? null)) {
    setLeaving(shown)
    setShown(entry)
  }

  return (
    <section className="lf-panel lf-spot" data-idle={idle || undefined} aria-label="Spotlight" aria-live="polite">
      {entry ? (
        <>
          {leaving && (
            <div className="lf-spot-out" onAnimationEnd={() => setLeaving(null)}>
              <Card entry={leaving} nowMs={nowMs} previewing={false} layer="out" idle={idle} />
            </div>
          )}
          <div className="lf-spot-in" key={entry.id}>
            <Card entry={entry} nowMs={nowMs} previewing={previewing} layer="in" idle={idle} />
          </div>
        </>
      ) : (
        <div className="lf-spot-empty">
          <p className="lf-empty-title">No one yet</p>
          <p className="lf-empty-text">The latest student to check in will be shown here.</p>
        </div>
      )}
    </section>
  )
}

export default Spotlight
