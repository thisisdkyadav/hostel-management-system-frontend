import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Button, Page } from "hzero"
import { Apple, Monitor, RefreshCw, Smartphone, Users } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import { queryKeys } from "@/lib/query"
import { appUsageApi } from "@/service"
import PageActivityView from "@/components/app-usage/PageActivityView"
import "@/components/app-usage/AppUsage.css"

const BROWSERS = {
  chrome: "Chrome",
  edge: "Edge",
  samsung: "Samsung Internet",
  firefox: "Firefox",
  opera: "Opera",
  safari: "Safari",
  inapp: "Inside another app",
  other: "Other",
}
// Browsers that can't install the app on that platform (students need another one).
const CANT_INSTALL = { android: new Set(["edge", "firefox", "opera", "inapp", "other"]), ios: new Set(["inapp"]) }
const PLATFORMS = { android: "Android", ios: "iPhone", desktop: "Computer" }

const number = (value) => (Number(value) || 0).toLocaleString("en-IN")
const percent = (part, whole) => {
  if (!whole) return "–"
  const value = Math.round((part / whole) * 100)
  return part > 0 && value === 0 ? "<1%" : `${value}%`
}
const ago = (value) => {
  if (!value) return ""
  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.round(hours / 24)
  return `${days} day${days === 1 ? "" : "s"} ago`
}
const dayLabel = (day) => new Date(`${day}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })

const Tile = ({ icon, label, value, note, tone }) => (
  <div className="au-tile" data-tone={tone}>
    <span className="au-tile__label">
      {icon} {label}
    </span>
    <span className="au-tile__value">{value}</span>
    {note && <span className="au-tile__note">{note}</span>}
  </div>
)

/** Android vs iPhone share of the students who have the app (one bar, legend + direct labels). */
const SplitBar = ({ android, ios }) => {
  const total = android + ios
  if (!total) return <p className="au-empty">Nobody has opened the installed app yet.</p>
  return (
    <div className="au-split">
      <div className="au-split__bar" role="img" aria-label={`Android ${android}, iPhone ${ios}`}>
        {android > 0 && <span data-series="1" style={{ flexGrow: android }} title={`Android: ${number(android)}`} />}
        {ios > 0 && <span data-series="2" style={{ flexGrow: ios }} title={`iPhone: ${number(ios)}`} />}
      </div>
      <ul className="au-legend">
        <li>
          <i data-series="1" aria-hidden="true" /> Android <b>{number(android)}</b> <small>{percent(android, total)}</small>
        </li>
        <li>
          <i data-series="2" aria-hidden="true" /> iPhone <b>{number(ios)}</b> <small>{percent(ios, total)}</small>
        </li>
      </ul>
      <p className="au-note">A student with the app on both counts in both.</p>
    </div>
  )
}

/** Students on phones (last 30 days) without the app, by the browser they use. */
const BrowserList = ({ platform, counts }) => {
  const rows = Object.entries(counts || {}).sort((a, b) => b[1] - a[1])
  const max = Math.max(1, ...rows.map(([, count]) => count))
  if (!rows.length) return <p className="au-empty">Nobody on {PLATFORMS[platform]} without the app.</p>
  return (
    <ul className="au-bars">
      {rows.map(([browser, count]) => (
        <li key={browser}>
          <span className="au-bars__label">
            {BROWSERS[browser] || browser}
            {CANT_INSTALL[platform]?.has(browser) && <small>can&apos;t install</small>}
          </span>
          <span className="au-bars__track">
            <span className="au-bars__fill" style={{ width: `${(count / max) * 100}%` }} />
          </span>
          <b>{number(count)}</b>
        </li>
      ))}
    </ul>
  )
}

/** New app users per day: one series, hover/focus a bar for its day and count. */
const TrendChart = ({ trend }) => {
  const [hover, setHover] = useState(null)
  const max = Math.max(1, ...trend.map((d) => d.count))
  const total = trend.reduce((sum, d) => sum + d.count, 0)
  const shown = hover !== null ? trend[hover] : null
  return (
    <div className="au-trend">
      <div className="au-trend__readout" aria-live="polite">
        {shown ? (
          <>
            <b>{number(shown.count)}</b> new on {dayLabel(shown.day)}
          </>
        ) : (
          <>
            <b>{number(total)}</b> in the last {trend.length} days
          </>
        )}
      </div>
      <div className="au-trend__plot" onMouseLeave={() => setHover(null)}>
        <span className="au-trend__max">{number(max)}</span>
        {trend.map((d, index) => (
          <button
            key={d.day}
            type="button"
            className="au-trend__col"
            data-active={hover === index || undefined}
            onMouseEnter={() => setHover(index)}
            onFocus={() => setHover(index)}
            onBlur={() => setHover(null)}
            aria-label={`${dayLabel(d.day)}: ${d.count} new`}
          >
            <span className="au-trend__bar" style={{ height: d.count ? `${Math.max(4, (d.count / max) * 100)}%` : 0 }} />
          </button>
        ))}
      </div>
      <div className="au-trend__axis">
        <span>{trend[0] && dayLabel(trend[0].day)}</span>
        <span>Today</span>
      </div>
    </div>
  )
}

/**
 * Student app view: how many students have the installed SMS app, on iPhone
 * and Android, and how students reach SMS. Students' browsers report every
 * visit, so the numbers are live; the page refreshes every 30 s.
 */
const StudentAppView = ({ query }) => {
  const data = query.data
  const installed = data?.installed
  const seen = data?.seen

  return (
    <>
        {query.isError && !data && <p className="au-error">Couldn&apos;t load app usage. Try refreshing.</p>}
        {!data && !query.isError && <p className="au-empty">Loading…</p>}
        {data && (
          <div className="au">
            <section className="au-tiles" aria-label="Summary">
              <Tile
                icon={<Smartphone size={16} aria-hidden="true" />}
                label="Have the app"
                value={number(installed.total)}
                note={`${percent(installed.total, data.activeStudents)} of ${number(data.activeStudents)} active students · ${number(installed.activeTotal)} used it in the last ${data.activeDays} days`}
                tone="1"
              />
              <Tile icon={<Smartphone size={16} aria-hidden="true" />} label="Android" value={number(installed.android)} note={`${number(installed.activeAndroid)} used it in the last ${data.activeDays} days`} />
              <Tile icon={<Apple size={16} aria-hidden="true" />} label="iPhone" value={number(installed.ios)} note={`${number(installed.activeIos)} used it in the last ${data.activeDays} days`} />
              <Tile
                icon={<Users size={16} aria-hidden="true" />}
                label={`Opened SMS · ${data.activeDays} days`}
                value={number(seen.total)}
                note={`${number(seen.today)} today · ${number(seen.android)} Android · ${number(seen.ios)} iPhone · ${number(seen.desktop)} computer`}
              />
            </section>

            <div className="au-grid">
              <section className="au-card">
                <h2 className="au-card__title">Who has the app</h2>
                <SplitBar android={installed.android} ios={installed.ios} />
              </section>

              <section className="au-card">
                <h2 className="au-card__title">New app users per day</h2>
                <TrendChart trend={data.trend} />
              </section>

              <section className="au-card">
                <h2 className="au-card__title">On Android without the app</h2>
                <p className="au-note">Students who opened SMS on Android in the last {data.activeDays} days, by browser. Chrome installs it; students on other browsers get a button to open SMS in Chrome.</p>
                <BrowserList platform="android" counts={data.withoutApp.android} />
              </section>

              <section className="au-card">
                <h2 className="au-card__title">On iPhone without the app</h2>
                <p className="au-note">Every iPhone browser can add it to the home screen, except browsers inside other apps (Instagram, Gmail…).</p>
                <BrowserList platform="ios" counts={data.withoutApp.ios} />
              </section>
            </div>

            <section className="au-card">
              <h2 className="au-card__title">Latest visits</h2>
              {data.recent.length === 0 ? (
                <p className="au-empty">No visits recorded yet. They appear as students open SMS.</p>
              ) : (
                <div className="au-table-wrap">
                  <table className="au-table">
                    <thead>
                      <tr>
                        <th scope="col">Student</th>
                        <th scope="col">Device</th>
                        <th scope="col">Opened in</th>
                        <th scope="col" className="au-num">
                          Visits
                        </th>
                        <th scope="col">Last seen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recent.map((row, index) => (
                        <tr key={`${row.rollNumber}-${index}`}>
                          <td>
                            <span className="au-who">{row.name || "Unknown"}</span>
                            <small>{row.rollNumber}</small>
                          </td>
                          <td>
                            <span className="au-device">
                              {row.platform === "desktop" ? <Monitor size={15} aria-hidden="true" /> : row.platform === "ios" ? <Apple size={15} aria-hidden="true" /> : <Smartphone size={15} aria-hidden="true" />}
                              {PLATFORMS[row.platform]} · {BROWSERS[row.browser] || row.browser}
                            </span>
                          </td>
                          <td>
                            <span className="au-pill" data-app={row.mode === "app" || undefined}>
                              {row.mode === "app" ? "The app" : "Browser"}
                            </span>
                          </td>
                          <td className="au-num">{number(row.visits)}</td>
                          <td>{ago(row.lastSeenAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}
    </>
  )
}

const VIEWS = [
  { id: "students", label: "Student app" },
  { id: "pages", label: "Pages & users" },
]

/**
 * App Usage (Admin). Two views: the students' installed SMS app, and every
 * role's page visits (per user: pages with counts, last 7 days visit by visit).
 * The view, role and user live in the URL.
 */
const AppUsagePage = () => {
  const queryClient = useQueryClient()
  const [params, setParams] = useSearchParams()
  const view = params.get("view") === "pages" ? "pages" : "students"
  const role = params.get("role") || "Student"
  const userId = params.get("user") || ""
  const setParam = (changes) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        for (const [key, value] of Object.entries(changes)) {
          if (value) next.set(key, value)
          else next.delete(key)
        }
        return next
      },
      { replace: true }
    )

  const stats = useQuery({
    queryKey: queryKeys.appUsage.stats,
    queryFn: () => appUsageApi.stats(),
    refetchInterval: 30_000,
    enabled: view === "students",
  })
  const fetching = view === "students" ? stats.isFetching : queryClient.isFetching({ queryKey: queryKeys.appUsage.all }) > 0

  return (
    <Page>
      <PageHeader
        title="App Usage"
        subtitle={view === "students" ? "Students with the SMS app on their phone, updated every time a student opens SMS." : "Who opens which pages, for every role. The last 7 days visit by visit; older visits as totals."}
      >
        <div className="au-head">
          <div className="au-tabs" role="tablist" aria-label="View">
            {VIEWS.map((v) => (
              <button key={v.id} type="button" role="tab" aria-selected={view === v.id} onClick={() => setParam({ view: v.id === "students" ? "" : v.id })}>
                {v.label}
              </button>
            ))}
          </div>
          {view === "students" && stats.data?.generatedAt && <span className="au-head__time">Updated {ago(stats.data.generatedAt)}</span>}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: queryKeys.appUsage.all })}
            disabled={fetching}
            aria-label="Refresh"
            title="Refresh"
          >
            <RefreshCw size={16} className={fetching ? "au-spin" : undefined} />
          </Button>
        </div>
      </PageHeader>
      <Page.Body>
        {view === "students" ? (
          <StudentAppView query={stats} />
        ) : (
          <PageActivityView role={role} onRole={(next) => setParam({ role: next, user: "" })} userId={userId} onUser={(id) => setParam({ user: id })} />
        )}
      </Page.Body>
    </Page>
  )
}

export default AppUsagePage
