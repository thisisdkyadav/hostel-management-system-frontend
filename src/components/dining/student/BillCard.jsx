import { useState } from "react"
import { StatusBadge } from "hzero"
import { formatRange, pluralize } from "../caterer/catererHelpers"
import { clearanceTone, formatClearance, formatCurrency } from "../diningBillingHelpers"

/** The latest mess bill: what's left in big type, the sums underneath, the per-period math on demand. */
const BillCard = ({ billingPeriods = [] }) => {
  const [open, setOpen] = useState(false)
  const [bill, ...earlier] = billingPeriods
  if (!bill) return null
  const negative = Number(bill.balance) < 0

  return (
    <section className="sd-card">
      <header className="sd-card__head">
        <h2 className="sd-card__title">Mess bill</h2>
        <StatusBadge status={formatClearance(bill.clearance)} tone={clearanceTone(bill.clearance)} />
      </header>
      <p className="sd-card__note">
        {bill.name}
        {bill.startDate ? ` · ${formatRange(bill.startDate, bill.endDate)}` : ""}
      </p>
      <div className="sd-bill__balance" data-negative={negative || undefined}>
        <span className="sd-bill__label">{negative ? "You owe" : "Balance left"}</span>
        <span className="sd-bill__amount">{formatCurrency(Math.abs(Number(bill.balance) || 0))}</span>
      </div>
      <dl className="sd-bill__sums">
        <div>
          <dt>Paid in</dt>
          <dd>{formatCurrency(bill.allocatedAmount)}</dd>
        </div>
        <div>
          <dt>Charged so far</dt>
          <dd>{formatCurrency(bill.totalCharged)}</dd>
        </div>
      </dl>
      {(bill.perPeriod?.length > 0 || earlier.length > 0) && (
        <button type="button" className="sd-link" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
          {open ? "Hide details" : "How is this worked out?"}
        </button>
      )}
      {open && (
        <ul className="sd-bill__lines">
          {(bill.perPeriod || []).map((row) => (
            <li key={row.periodId}>
              <span>
                {formatRange(row.startDate, row.endDate)} · {pluralize(row.chargeableDays, "day")} × {formatCurrency(row.dailyRate)}
                {row.rebateDays > 0 ? ` (${pluralize(row.rebateDays, "away day")} not charged)` : ""}
              </span>
              <strong>{formatCurrency(row.amount)}</strong>
            </li>
          ))}
          {earlier.map((item) => (
            <li key={item.id}>
              <span>
                {item.name} · {formatClearance(item.clearance)}
              </span>
              <strong>{formatCurrency(item.balance)}</strong>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default BillCard
