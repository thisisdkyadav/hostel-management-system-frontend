import { useMemo, useState } from "react"
import { formatDateTime } from "@/components/dining/diningPeriodHelpers"

/** The four places a student's photo can be, in the order the field fills. */
const STATUS_GROUPS = [
  { key: "valid", label: "can scan on every machine", tone: "ok" },
  { key: "pending", label: "on their way to the machines", tone: "warn" },
  { key: "failed", label: "refused by a machine", tone: "bad" },
  { key: "missing", label: "have no photo yet", tone: "none" },
]

/** What the machines sent back when HMS asked for the photo they hold. */
const CHECK_GROUPS = [
  { key: "match", label: "same photo, face made", tone: "ok" },
  { key: "mismatch", label: "wrong or no photo on a machine", tone: "bad" },
  { key: "noFace", label: "no face made from it", tone: "bad" },
  { key: "checking", label: "being checked", tone: "warn" },
  { key: "unchecked", label: "not checked yet", tone: "none" },
]

const number = (value) => (value || 0).toLocaleString("en-IN")

/** Squares for each group: one per student, or one per N when there are many. */
const layoutField = (status, total) => {
  const per = Math.max(1, Math.ceil(total / 360))
  const cells = []
  for (const group of STATUS_GROUPS) {
    const count = status[group.key] || 0
    const squares = count ? Math.max(1, Math.round(count / per)) : 0
    for (let i = 0; i < squares; i++) cells.push(group.key)
  }
  return { per, cells }
}

/**
 * The default view of Scanner Photos: every active student as part of one field
 * of squares, coloured by whether they can scan their face at the mess. The
 * legend under it is the way into each group.
 */
const ScannerOverview = ({ stats, onPick }) => {
  const [focus, setFocus] = useState("")
  const total = stats?.total || 0
  const status = stats?.status || {}
  const checks = stats?.checks || {}
  const { per, cells } = useMemo(() => layoutField(stats?.status || {}, stats?.total || 0), [stats])
  const withPhoto = stats?.withPhoto || 0
  const checkedTotal = CHECK_GROUPS.reduce((sum, group) => sum + (checks[group.key] || 0), 0)

  if (!stats) return <div className="so-field so-field--loading" aria-busy="true" />

  return (
    <section className="so" aria-label="Scanner photo overview">
      <p className="so-lede">
        <strong>{number(status.valid)}</strong> of {number(total)} active students can scan their face at the mess.
      </p>

      <div className="so-field" role="img" aria-label={STATUS_GROUPS.map((g) => `${number(status[g.key])} ${g.label}`).join(", ")} data-focus={focus || undefined}>
        {cells.map((key, index) => (
          <span key={index} className="so-cell" data-group={key} style={{ "--i": index }} />
        ))}
      </div>
      <p className="so-scale">{per === 1 ? "Each square is a student." : `Each square is about ${per} students.`}</p>

      <ul className="so-legend">
        {STATUS_GROUPS.map((group) => (
          <li key={group.key}>
            <button
              type="button"
              className="so-legend__item"
              data-tone={group.tone}
              disabled={!status[group.key]}
              onMouseEnter={() => setFocus(group.key)}
              onMouseLeave={() => setFocus("")}
              onFocus={() => setFocus(group.key)}
              onBlur={() => setFocus("")}
              onClick={() => onPick(group.key)}
            >
              <span className="so-swatch" aria-hidden="true" />
              <span className="so-legend__count">{number(status[group.key])}</span>
              <span className="so-legend__label">{group.label}</span>
            </button>
          </li>
        ))}
      </ul>

      {withPhoto > 0 && checkedTotal > 0 && (
        <div className="so-block">
          <h2 className="so-heading">What the machines sent back</h2>
          <p className="so-note">Each night HMS asks the machines for the photo they hold and compares it with the one in HMS.</p>
          <div className="so-bar" role="img" aria-label={CHECK_GROUPS.map((g) => `${number(checks[g.key])} ${g.label}`).join(", ")}>
            {CHECK_GROUPS.map((group) => (checks[group.key] ? <span key={group.key} data-tone={group.tone} style={{ flexGrow: checks[group.key] }} /> : null))}
          </div>
          <ul className="so-legend so-legend--compact">
            {CHECK_GROUPS.map((group) => (
              <li key={group.key}>
                <button type="button" className="so-legend__item" data-tone={group.tone} disabled={!checks[group.key]} onClick={() => onPick(group.key)}>
                  <span className="so-swatch" aria-hidden="true" />
                  <span className="so-legend__count">{number(checks[group.key])}</span>
                  <span className="so-legend__label">{group.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {stats.machines?.length > 0 ? (
        <div className="so-block">
          <h2 className="so-heading">Machines</h2>
          <ul className="so-machines">
            {stats.machines.map((machine) => {
              const share = withPhoto ? Math.round((machine.ok / withPhoto) * 100) : 0
              return (
                <li key={machine.sn} className="so-machine">
                  <span className="so-machine__name">{machine.alias}</span>
                  <span className="so-machine__track" aria-hidden="true">
                    <span style={{ width: `${share}%` }} />
                  </span>
                  <span className="so-machine__text">
                    holds {number(machine.ok)} of {number(withPhoto)} photos
                    {machine.waiting ? `, ${number(machine.waiting)} on the way` : ""}
                    {machine.refused ? `, refused ${number(machine.refused)}` : ""}
                    {machine.lastCheckAt ? `. Last checked ${formatDateTime(machine.lastCheckAt)}` : ""}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      ) : (
        <p className="so-note">No machine is kept in sync yet. Switch on roster sync on the Face Scanners page.</p>
      )}
    </section>
  )
}

export default ScannerOverview
