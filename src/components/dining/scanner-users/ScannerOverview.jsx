import { ChevronRight } from "lucide-react"
import { ago, number } from "./scannerUsersHelpers"

/** How every active student's photo stands, in the order of the coverage strip. */
const STRIP = [
  { key: "valid", label: "Ready", tone: "ok" },
  { key: "pending", label: "Sending", tone: "warn" },
  { key: "failed", label: "Refused", tone: "bad" },
  { key: "missing", label: "No photo", tone: "none" },
]

/** The work list: each group staff may need to act on, most urgent first. */
const QUEUE = [
  { key: "failed", from: "status", tone: "bad", title: "Refused by a machine", text: "The machine couldn't make a face from the photo. The student needs a new one." },
  { key: "noFace", from: "checks", tone: "bad", title: "No face made", text: "A machine holds the photo but made no face from it." },
  { key: "mismatch", from: "checks", tone: "bad", title: "Wrong photo on a machine", text: "A machine sent back a different photo than HMS, or none." },
  { key: "missing", from: "status", tone: "none", title: "No photo", text: null },
  { key: "pending", from: "status", tone: "warn", title: "Sending", text: "On their way. A machine that's off gets them when it's back." },
  { key: "unchecked", from: "checks", tone: "none", title: "Not checked yet", text: "Not fetched back from the machines yet. Checked every night." },
]

/** One face machine, drawn as the device: its screen shows how many faces it holds. */
const Machine = ({ machine, withPhoto }) => {
  const online = machine.online
  const extra = [machine.waiting ? `${number(machine.waiting)} on the way` : "", machine.refused ? `${number(machine.refused)} refused` : ""].filter(Boolean).join(" · ")
  return (
    <li className="so-device">
      <div className="so-device__body" aria-hidden="true">
        <span className="so-device__cam" />
        <span className="so-device__screen">
          <strong>{number(machine.ok)}</strong>
          <small>of {number(withPhoto)}</small>
        </span>
        <span className="so-device__led" data-on={online || undefined} />
      </div>
      <div className="so-device__text">
        <strong>{machine.alias}</strong>
        <span data-on={online || undefined}>{online ? "Online" : machine.lastSeenAt ? `Last seen ${ago(machine.lastSeenAt)}` : "Never seen"}</span>
        {extra && <span className="so-device__extra">{extra}</span>}
      </div>
    </li>
  )
}

/**
 * The default view of Scanner Photos: how many students can scan their face,
 * what each machine holds, and the groups that need someone's attention.
 */
const ScannerOverview = ({ stats, onPick }) => {
  if (!stats) return <div className="so-loading" aria-busy="true" />

  const total = stats.total || 0
  const status = stats.status || {}
  const checks = stats.checks || {}
  const ready = status.valid || 0
  const percent = total ? Math.floor((ready / total) * 100) : 0
  const count = (item) => (item.from === "status" ? status[item.key] : checks[item.key]) || 0
  const missingText =
    stats.missingWithProfile > 0
      ? `No scanner photo yet. ${number(stats.missingWithProfile)} of them have a profile photo that can be used.`
      : "No scanner photo yet. They can send one from their Dining page."

  return (
    <div className="so">
      <section className="so-hero" aria-label="Face scanning at the mess">
        <div className="so-cover">
          <p className="so-cover__eyebrow">Face scanning at the mess</p>
          <p className="so-cover__figure">
            <strong>{percent}%</strong>
            <span>
              of active students can scan
              <br />
              {number(ready)} of {number(total)}
            </span>
          </p>
          <div className="so-strip" role="img" aria-label={STRIP.map((s) => `${number(status[s.key])} ${s.label}`).join(", ")}>
            {STRIP.map((s) => (status[s.key] ? <span key={s.key} data-tone={s.tone} style={{ flexGrow: status[s.key] }} /> : null))}
          </div>
          <ul className="so-strip__legend">
            {STRIP.map((s) => (
              <li key={s.key}>
                <button type="button" data-tone={s.tone} disabled={!status[s.key]} onClick={() => onPick(s.key)}>
                  <i aria-hidden="true" />
                  {s.label} <b>{number(status[s.key])}</b>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {stats.machines?.length ? (
          <ul className="so-devices" aria-label="Machines">
            {stats.machines.map((machine) => (
              <Machine key={machine.sn} machine={machine} withPhoto={stats.withPhoto} />
            ))}
          </ul>
        ) : (
          <p className="so-empty">No machine is kept in sync yet. Switch on roster sync on the Face Scanners page.</p>
        )}
      </section>

      <section className="so-queue" aria-label="Needs attention">
        <h2>Needs attention</h2>
        <ul>
          {QUEUE.map((item) => {
            const n = count(item)
            return (
              <li key={item.key}>
                <button type="button" className="so-queue__row" data-tone={item.tone} disabled={!n} onClick={() => onPick(item.key)}>
                  <i aria-hidden="true" />
                  <span className="so-queue__text">
                    <strong>{item.title}</strong>
                    <span>{n ? item.text || missingText : "None"}</span>
                  </span>
                  <b className="so-queue__count">{number(n)}</b>
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}

export default ScannerOverview
