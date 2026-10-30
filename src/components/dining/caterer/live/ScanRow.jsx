import { memo } from "react"
import { Check, Keyboard, ScanFace } from "lucide-react"
import { StatusBadge } from "hzero"
import { SCAN_SOURCE_LABELS } from "../catererHelpers"
import { catererColor } from "../diningScope"
import DiningTagChips from "../../DiningTagChips"
import ScanPhoto from "./ScanPhoto"
import { exactTime, isIssue, issueLabel, issueTone, relativeTime } from "./liveHelpers"

const SourceIcon = ({ source }) => {
  const label = SCAN_SOURCE_LABELS[source] || "Scanned"
  const Icon = source === "manual" ? Keyboard : ScanFace
  return (
    <span className="lf-row-source" title={label} role="img" aria-label={label}>
      <Icon size={16} aria-hidden="true" />
    </span>
  )
}

/** One scan: who, where they live, how they were checked in, when, and (only if it went wrong) why. */
const ScanRow = ({ entry, nowMs, previewing, onPreview, palette, showCaterer = false }) => {
  const issue = isIssue(entry)
  const tone = issue ? issueTone(entry) : undefined
  const show = () => onPreview(entry.id)
  const hide = () => onPreview(null)
  const tagged = showCaterer && entry.caterer

  return (
    <li className="lf-row-wrap" data-fresh={entry.fresh ? tone || "ok" : undefined}>
      <div
        className="lf-row"
        data-issue={tone}
        data-previewing={previewing || undefined}
        data-caterer={tagged ? "" : undefined}
        style={tagged ? { "--kitchen": catererColor(palette, entry.caterer.id) } : undefined}
      >
        <button
          type="button"
          className="lf-row-photo"
          aria-label={`Show ${entry.name} in the spotlight`}
          onPointerEnter={(event) => { if (event.pointerType !== "touch") show() }}
          onPointerLeave={hide}
          onFocus={show}
          onBlur={hide}
        >
          <ScanPhoto photo={entry.photo} name={entry.name} />
        </button>
        <div className="lf-row-who">
          <span className="lf-row-name">{entry.name}</span>
          <span className="lf-row-meta">
            <span className="lf-row-roll">{entry.rollNumber}</span>
            {entry.room && <span className="lf-row-room">{entry.room}</span>}
          </span>
          {entry.tags?.length > 0 && <DiningTagChips tags={entry.tags} max={2} />}
        </div>
        {tagged && (
          <span className="lf-row-caterer" title={`Scanned at ${entry.caterer.name}`}>
            <span>{entry.caterer.name}</span>
          </span>
        )}
        <SourceIcon source={entry.source} />
        <time className="lf-row-time" dateTime={entry.scannedAt} title={exactTime(entry.scannedAt)}>
          {relativeTime(entry.scannedAt, nowMs)}
        </time>
        {issue ? (
          <span className="lf-row-status">
            <StatusBadge status={issueLabel(entry)} tone={tone} />
          </span>
        ) : (
          <span className="lf-row-ok" role="img" aria-label="Verified" title="Verified">
            <Check size={18} aria-hidden="true" />
          </span>
        )}
      </div>
    </li>
  )
}

export default memo(ScanRow)
