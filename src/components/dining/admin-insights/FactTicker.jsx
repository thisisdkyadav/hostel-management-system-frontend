import { Link } from "react-router-dom"
import { Skeleton } from "hzero"
import { CalendarClock, ClipboardCheck, Ghost, Heart, ScanFace, Sparkles, Trophy, UserX, UtensilsCrossed, Wallet, Zap } from "lucide-react"
import { dayLabel, fmtCompact, fmtInt, fmtPct, friendlyTime, isoToMinutes, slotName } from "./insightHelpers"

const buildFacts = (data, billing, rebates) => {
  const facts = []
  const students = data?.students || {}
  const records = data?.records || {}
  const caterers = data?.caterers || []
  const mealSlots = data?.mealSlots || []

  const pending = rebates?.pending ?? data?.totals?.pendingRebates ?? 0
  if (pending > 0) facts.push({ key: "pending", icon: ClipboardCheck, tone: "warning", to: "/admin/dining-rebates", text: <><strong>{fmtInt(pending)}</strong> rebate requests are waiting for approval</> })
  if (students.ghosts > 0) facts.push({ key: "ghosts", icon: Ghost, tone: "warning", text: <><strong>{fmtInt(students.ghosts)}</strong> students haven&apos;t eaten a single meal this week</> })

  const unused = caterers.reduce((s, c) => s + (c.unusedPlates7d || 0), 0)
  if (unused > 0) facts.push({ key: "unused", icon: UtensilsCrossed, text: <>About <strong>{fmtInt(unused)}</strong> plates were cooked but not eaten this week</> })

  if (records.busiestMinute) {
    facts.push({ key: "minute", icon: Zap, text: <>Busiest minute: <strong>{fmtInt(records.busiestMinute.scans)} students</strong> walked in at {friendlyTime(isoToMinutes(records.busiestMinute.at))}</> })
  }
  if (students.regulars > 0) facts.push({ key: "regulars", icon: Heart, tone: "success", text: <><strong>{fmtInt(students.regulars)}</strong> regulars eat almost every meal</> })

  const scanner = data?.scanner
  if (scanner?.verified > 0) {
    const issues = Object.values(scanner.issues || {}).reduce((s, n) => s + n, 0)
    facts.push({ key: "scans", icon: ScanFace, text: <><strong>{fmtPct(scanner.verified / (scanner.verified + issues))}</strong> of scans go through first time</> })
  }
  if (records.busiestMeal) {
    facts.push({ key: "meal", icon: Trophy, text: <>Biggest meal: <strong>{slotName(mealSlots, records.busiestMeal.mealSlotKey)}</strong> on {dayLabel(records.busiestMeal.date)}, {fmtInt(records.busiestMeal.verified)} ate</> })
  }
  if (students.neverScanned > 0) facts.push({ key: "never", icon: UserX, text: <><strong>{fmtInt(students.neverScanned)}</strong> students have not eaten here once this period</> })

  if (billing?.totalAllocated) facts.push({ key: "billing", icon: Wallet, to: "/admin/dining-billing", text: <><strong>₹{fmtCompact(billing.totalAllocated)}</strong> billed this period</> })
  if (billing?.duesCount > 0) facts.push({ key: "dues", icon: CalendarClock, tone: "danger", to: "/admin/dining-billing", text: <><strong>{fmtInt(billing.duesCount)}</strong> students have dues to clear</> })

  return facts
}

const Fact = ({ fact, hidden }) => {
  const Icon = fact.icon
  const body = (
    <>
      <span className="dxi-fact-icon"><Icon size={15} aria-hidden="true" /></span>
      <span className="dxi-fact-text">{fact.text}</span>
    </>
  )
  return (
    <li className="dxi-fact" data-tone={fact.tone} aria-hidden={hidden || undefined}>
      {fact.to ? <Link to={fact.to} tabIndex={hidden ? -1 : undefined}>{body}</Link> : <span>{body}</span>}
    </li>
  )
}

/** A slow-moving ribbon of plain-language facts. Hover to pause; click the ones that lead somewhere. */
const FactTicker = ({ data, billing, rebates, loading }) => {
  const facts = buildFacts(data, billing, rebates)
  return (
    <section className="dxi-ticker" aria-label="Good to know">
      <span className="dxi-ticker-label"><Sparkles size={15} aria-hidden="true" /> Good to know</span>
      <div className="dxi-ticker-window">
        {loading && facts.length === 0 ? (
          <Skeleton variant="text" width="60%" />
        ) : (
          <ul className="dxi-ticker-track" style={{ "--duration": `${Math.max(30, facts.length * 7)}s` }}>
            {facts.map((fact) => <Fact key={fact.key} fact={fact} />)}
            {facts.map((fact) => <Fact key={`${fact.key}-again`} fact={fact} hidden />)}
          </ul>
        )}
      </div>
    </section>
  )
}

export default FactTicker
