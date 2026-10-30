import { useState } from "react"
import { Button, StatusBadge } from "hzero"
import { Plane } from "lucide-react"
import PdfViewerModal from "@/components/common/pdf/PdfViewerModal"
import { formatRange, toDayKey } from "../caterer/catererHelpers"
import { formatRebateStatus, rebateStatusTone } from "../diningPeriodHelpers"

const SHOWN = 4

/** Rebates as "times I'm away": upcoming first, then the rest, newest first. */
const AwayCard = ({ rebates = [], today, canRequest, onRequest }) => {
  const [showAll, setShowAll] = useState(false)
  const [viewForm, setViewForm] = useState(null)
  const sorted = [...rebates].sort((a, b) => {
    const aEnd = toDayKey(a.endDate)
    const bEnd = toDayKey(b.endDate)
    const aAhead = aEnd >= today
    const bAhead = bEnd >= today
    if (aAhead !== bAhead) return aAhead ? -1 : 1
    return aAhead ? toDayKey(a.startDate).localeCompare(toDayKey(b.startDate)) : bEnd.localeCompare(aEnd)
  })
  const visible = showAll ? sorted : sorted.slice(0, SHOWN)

  return (
    <section className="sd-card">
      <header className="sd-card__head">
        <h2 className="sd-card__title">Away from the mess</h2>
        <Button variant="secondary" size="sm" onClick={onRequest} disabled={!canRequest}>
          <Plane size={15} /> I&apos;ll be away
        </Button>
      </header>
      <p className="sd-card__note">Tell us when you won&apos;t eat here and those days are not charged.</p>
      {visible.length === 0 ? (
        <p className="sd-card__empty">No rebates yet.</p>
      ) : (
        <ul className="sd-away">
          {visible.map((rebate) => {
            const ahead = toDayKey(rebate.endDate) >= today
            return (
              <li key={rebate.id} className="sd-away__row" data-ahead={ahead || undefined}>
                <div className="sd-away__when">
                  <span className="sd-away__dates">{formatRange(rebate.startDate, rebate.endDate)}</span>
                  <span className="sd-away__meta">
                    {rebate.dayCount} {rebate.dayCount === 1 ? "day" : "days"}
                    {rebate.adminComment || rebate.reason ? ` · ${rebate.adminComment || rebate.reason}` : ""}
                  </span>
                </div>
                <div className="sd-away__side">
                  {rebate.form?.ref && (
                    <button type="button" className="sd-link" onClick={() => setViewForm(rebate.form)}>
                      View form
                    </button>
                  )}
                  <StatusBadge status={formatRebateStatus(rebate.status)} tone={rebateStatusTone(rebate.status)} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
      {sorted.length > SHOWN && (
        <button type="button" className="sd-link" onClick={() => setShowAll((value) => !value)}>
          {showAll ? "Show fewer" : `Show all ${sorted.length}`}
        </button>
      )}
      <PdfViewerModal
        isOpen={Boolean(viewForm)}
        onClose={() => setViewForm(null)}
        documentUrl={viewForm?.ref}
        title="Long-term rebate form"
        subtitle="The form you submitted"
        downloadFileName={viewForm?.name || "rebate-form.pdf"}
      />
    </section>
  )
}

export default AwayCard
