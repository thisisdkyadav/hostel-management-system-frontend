import { useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Search, Smartphone } from "lucide-react"
import { queryKeys } from "@/lib/query"
import { appUsageApi } from "@/service"
import { useDebouncedValue } from "@/components/dining/caterer/rebates/rebateHelpers"
import { SIDEBAR_DEFAULT_MODE, SIDEBAR_MODE_OPTIONS, resolveSidebarMode } from "@/components/sidebar/sidebarModes"
import { isCsoAdminSubRole } from "@/constants/navigationConfig"

const number = (value) => (Number(value) || 0).toLocaleString("en-IN")
const time = (value) => new Date(value).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })
const dateTime = (value) =>
  value ? new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "—"
const ago = (value) => {
  if (!value) return "never"
  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.round(hours / 24)
  return `${days} day${days === 1 ? "" : "s"} ago`
}
const dayTitle = (day, index) => {
  if (index === 0) return "Today"
  if (index === 1) return "Yesterday"
  return new Date(`${day}T00:00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })
}
const pageName = (row) => row.label || row.page

/** "V4 · Icon rail", "X3 · Sketchbook"; unknown ids fall back to the raw id. */
const sidebarModeName = (mode) => {
  const option = SIDEBAR_MODE_OPTIONS.find((o) => o.id === mode)
  return option ? `${option.label} · ${option.name}` : mode || "—"
}
const sidebarModeShort = (mode) => SIDEBAR_MODE_OPTIONS.find((o) => o.id === mode)?.label || mode || "—"
/** Saved layout → what the admin actually sees (older versions are raised to the stable one). */
const shownSidebarMode = (saved) => resolveSidebarMode({ dbMode: saved || undefined })
/** Fold {mode, subRole, users} rows into counts of the layout each admin actually sees. */
const shownModeCounts = (rows = []) => {
  const counts = new Map()
  for (const row of rows) {
    if (isCsoAdminSubRole(row.subRole)) continue
    const key = row.mode ? shownSidebarMode(row.mode) : null
    counts.set(key, (counts.get(key) || 0) + row.users)
  }
  return [...counts].map(([mode, users]) => ({ mode, users })).sort((a, b) => b.users - a.users)
}
const hasSidebarChoice = (user) => user.role === "Admin" && !isCsoAdminSubRole(user.subRole)

/** Current sidebar layout, when it last changed, and every layout this admin has switched to. */
const SidebarHistory = ({ sidebar }) => {
  const saved = sidebar?.mode || null
  const shown = shownSidebarMode(saved)
  const history = sidebar?.history || []
  const tried = [...new Set(history.map((h) => h.mode).concat(saved ? [saved] : []))]
  return (
    <section>
      <h4 className="au-sub">Sidebar</h4>
      <div className="au-sb">
        <div className="au-sb__now">
          <span className="au-sb__label">Using now</span>
          <span className="au-sb__mode">{sidebarModeName(shown)}</span>
          <small>
            {!saved
              ? `Never picked one — gets the default (${sidebarModeShort(SIDEBAR_DEFAULT_MODE)})`
              : saved !== shown
                ? `Saved ${sidebarModeName(saved)}, shown as ${sidebarModeShort(shown)} for now`
                : sidebar?.updatedAt
                  ? `Switched ${ago(sidebar.updatedAt)} · ${dateTime(sidebar.updatedAt)}`
                  : "Picked before tracking started"}
          </small>
        </div>
        <div className="au-sb__now">
          <span className="au-sb__label">Tried so far</span>
          {tried.length ? (
            <span className="au-sb__chips">
              {tried.map((mode) => (
                <span key={mode} className="au-sb__chip" data-current={mode === shown || undefined} title={sidebarModeName(mode)}>
                  {sidebarModeShort(mode)}
                </span>
              ))}
            </span>
          ) : (
            <small>Only the default</small>
          )}
        </div>
      </div>
      {history.length > 0 && (
        <ol className="au-visits au-sb__log">
          {[...history].reverse().map((entry, index) => (
            <li key={`${entry.mode}-${entry.at}-${index}`}>
              <time dateTime={entry.at || undefined}>{entry.at ? dateTime(entry.at) : "Before tracking"}</time>
              <span className="au-visits__page">{sidebarModeName(entry.mode)}</span>
              {index === 0 && <span className="au-visits__tag">current</span>}
            </li>
          ))}
        </ol>
      )}
      {history.length === 0 && (
        <p className="au-note">Switches are recorded from {new Date(2026, 10, 26).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} onwards.</p>
      )}
    </section>
  )
}

const Pager = ({ page, total, limit, onPage }) => {
  const pages = Math.max(1, Math.ceil(total / limit))
  if (pages <= 1) return null
  return (
    <div className="au-pager">
      <button type="button" onClick={() => onPage(page - 1)} disabled={page <= 1}>
        Previous
      </button>
      <span>
        {page} of {pages}
      </span>
      <button type="button" onClick={() => onPage(page + 1)} disabled={page >= pages}>
        Next
      </button>
    </div>
  )
}

/** One user's pages (all time) and their last 7 days, visit by visit. */
const UserActivity = ({ userId }) => {
  const query = useQuery({
    queryKey: queryKeys.appUsage.user(userId),
    queryFn: () => appUsageApi.userActivity(userId),
    refetchInterval: 30_000,
  })
  if (query.isError) return <p className="au-error">Couldn&apos;t load this user&apos;s activity.</p>
  if (!query.data) return <p className="au-empty">Loading…</p>
  const { user, sidebar, totalVisits, lastAt, pages, days } = query.data
  return (
    <div className="au-user">
      <header className="au-user__head">
        <h3 className="au-user__name">{user.name || user.email}</h3>
        <p className="au-note">
          {user.email} · {user.role}
          {user.subRole ? ` (${user.subRole})` : ""}
        </p>
        <p className="au-user__sum">
          <b>{number(totalVisits)}</b> page visits · last seen {ago(lastAt)}
        </p>
      </header>

      {hasSidebarChoice(user) && <SidebarHistory sidebar={sidebar} />}

      <section>
        <h4 className="au-sub">Pages</h4>
        {pages.length === 0 ? (
          <p className="au-empty">Hasn&apos;t opened any page yet.</p>
        ) : (
          <div className="au-table-wrap">
            <table className="au-table">
              <thead>
                <tr>
                  <th scope="col">Page</th>
                  <th scope="col" className="au-num">
                    Visits
                  </th>
                  <th scope="col">Last visit</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((row) => (
                  <tr key={row.page}>
                    <td>
                      <span className="au-who">{pageName(row)}</span>
                      {row.label && <small>{row.page}</small>}
                    </td>
                    <td className="au-num">{number(row.count)}</td>
                    <td>{dateTime(row.lastAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h4 className="au-sub">Last 7 days</h4>
        <ol className="au-days">
          {days.map((day, index) => (
            <li key={day.day} className="au-day">
              <div className="au-day__head">
                <span>{dayTitle(day.day, index)}</span>
                <small>{day.visits.length ? `${number(day.visits.length)} visit${day.visits.length === 1 ? "" : "s"}` : "No visits"}</small>
              </div>
              {day.visits.length > 0 && (
                <ol className="au-visits">
                  {day.visits.map((visit, at) => (
                    <li key={`${visit.at}-${at}`}>
                      <time dateTime={visit.at}>{time(visit.at)}</time>
                      <span className="au-visits__page" title={visit.path}>
                        {pageName(visit)}
                      </span>
                      {visit.mode === "app" && (
                        <span className="au-visits__tag">
                          <Smartphone size={12} aria-hidden="true" /> app
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

/**
 * Every role: who opens SMS, which pages, and when. Pick a role, then a user;
 * older activity is kept as per-page totals, the last 7 days visit by visit.
 */
const PageActivityView = ({ role, onRole, userId, onUser }) => {
  const [searchInput, setSearchInput] = useState("")
  const [page, setPage] = useState(1)
  const search = useDebouncedValue(searchInput.trim(), 250)

  const roles = useQuery({ queryKey: queryKeys.appUsage.roles, queryFn: () => appUsageApi.roles(), refetchInterval: 30_000 })
  const params = { role, search, page }
  const users = useQuery({
    queryKey: queryKeys.appUsage.users(params),
    queryFn: () => appUsageApi.users(params),
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
    enabled: Boolean(role),
  })
  const days = roles.data?.days || 7
  const roleRows = (roles.data?.roles || []).filter((r) => r.users > 0)

  const pickRole = (next) => {
    onRole(next)
    setPage(1)
    setSearchInput("")
  }

  return (
    <div className="au">
      <div className="au-roles" role="tablist" aria-label="Role">
        {roleRows.map((r) => (
          <button key={r.role} type="button" role="tab" aria-selected={r.role === role} onClick={() => pickRole(r.role)}>
            <span className="au-roles__name">{r.role}</span>
            <span className="au-roles__num">
              <b>{number(r.activeUsers)}</b> of {number(r.users)} active
            </span>
            <small>
              {number(r.recentVisits)} visits · {days} days
            </small>
          </button>
        ))}
        {roles.isError && <p className="au-error">Couldn&apos;t load roles.</p>}
      </div>

      <div className="au-split-view">
        <section className="au-card au-people">
          <label className="au-search">
            <Search size={16} aria-hidden="true" />
            <input
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value)
                setPage(1)
              }}
              placeholder="Find someone by name or email"
              aria-label="Find a user by name or email"
            />
          </label>
          {role === "Admin" && users.data?.sidebarModes?.length > 0 && (
            <div className="au-sb-sum" aria-label="Admins per sidebar version">
              <span className="au-sb__label">Sidebar versions</span>
              <span className="au-sb__chips">
                {shownModeCounts(users.data.sidebarModes).map((row) => (
                  <span key={row.mode || "default"} className="au-sb__chip" title={row.mode ? sidebarModeName(row.mode) : `Never picked one — sees ${sidebarModeName(SIDEBAR_DEFAULT_MODE)}`}>
                    {row.mode ? sidebarModeShort(row.mode) : "Default"} <b>{number(row.users)}</b>
                  </span>
                ))}
              </span>
            </div>
          )}
          {users.isError && <p className="au-error">Couldn&apos;t load users.</p>}
          {users.data && users.data.items.length === 0 && (
            <p className="au-empty">{search ? "Nobody matches." : `No ${role} has opened SMS since tracking started.`}</p>
          )}
          <ul className="au-people__list">
            {(users.data?.items || []).map((u) => (
              <li key={u.userId}>
                <button type="button" aria-pressed={u.userId === userId} onClick={() => onUser(u.userId)}>
                  <span className="au-people__name">{u.name || u.email}</span>
                  <small>{u.email}</small>
                  <span className="au-people__stats">
                    {u.visits ? (
                      <>
                        <b>{number(u.recentVisits)}</b> in {days} days · {number(u.visits)} total · {ago(u.lastAt)}
                      </>
                    ) : (
                      "Never opened SMS"
                    )}
                  </span>
                  {role === "Admin" && !isCsoAdminSubRole(u.subRole) && (
                    <span className="au-people__stats">
                      Sidebar {sidebarModeShort(shownSidebarMode(u.sidebarMode))}
                      {u.sidebarModeUpdatedAt ? ` · switched ${ago(u.sidebarModeUpdatedAt)}` : u.sidebarMode ? "" : " (default)"}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
          {users.data && <Pager page={page} total={users.data.total} limit={users.data.limit} onPage={setPage} />}
        </section>

        <section className="au-card au-detail">
          {userId ? <UserActivity userId={userId} /> : <p className="au-empty">Pick someone to see the pages they opened and their last {days} days.</p>}
        </section>
      </div>
    </div>
  )
}

export default PageActivityView
