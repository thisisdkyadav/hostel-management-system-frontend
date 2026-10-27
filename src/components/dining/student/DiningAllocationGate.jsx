import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useLocation } from "react-router-dom"
import { Alert, Button, ConfirmDialog } from "hzero"
import { CalendarDays, CircleCheck, Clock, Users } from "lucide-react"
import LoadingPage from "@/pages/LoadingPage"
import useAuthz from "@/hooks/useAuthz"
import { useAuth } from "@/contexts/AuthProvider"
import { catererInitials, formatRange } from "@/components/dining/caterer/catererHelpers"
import { getErrorMessage } from "@/components/dining/diningPeriodHelpers"
import { CatererOptions } from "./DiningModals"
import useChooseCaterer from "./useChooseCaterer"
import { studentDiningPortalQuery } from "./portalQuery"
import "./StudentDining.css"

const SELECTING_REFRESH_MS = 5000

// Periods the student skipped in this page load. Module-level on purpose: it
// survives in-app navigation (layout remounts) but a reload or a fresh visit
// asks again, which is the point while the choice is still pending.
const skippedPeriods = new Set()

const periodKey = (period) => String(period?.id || period?._id || "")

const formatWhen = (value) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : ""

const DAY_MS = 86_400_000
const HOUR_MS = 3_600_000
const URGENT_MS = DAY_MS

const periodDays = (period) => {
  const start = Date.parse(String(period?.startDate || "").slice(0, 10))
  const end = Date.parse(String(period?.endDate || "").slice(0, 10))
  return Number.isFinite(start) && Number.isFinite(end) ? Math.round((end - start) / DAY_MS) + 1 : 0
}

const formatCountdown = (ms) => {
  if (ms <= 0) return "now"
  const days = Math.floor(ms / DAY_MS)
  const hours = Math.floor((ms % DAY_MS) / HOUR_MS)
  const minutes = Math.max(1, Math.floor((ms % HOUR_MS) / 60_000))
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

// Re-render on a slow clock so the "closes in" countdown stays current.
const useNow = (intervalMs) => {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])
  return now
}

const Fact = ({ icon, title, detail, tone }) => (
  <li className="sd-gate__fact" data-tone={tone || undefined}>
    <span className="sd-gate__fact-icon" aria-hidden="true">
      {icon}
    </span>
    <span className="sd-gate__fact-text">
      <strong>{title}</strong>
      {detail && <small>{detail}</small>}
    </span>
  </li>
)

/**
 * While a caterer-selection window is open and the student hasn't chosen yet,
 * every app open shows this screen instead of the portal: the open period, the
 * caterers with live seats, and a way to skip to the dashboard. Anything that
 * stops it from deciding (no dining access, a failed read) falls through to
 * the portal rather than blocking the student.
 */
const DiningAllocationGate = ({ children }) => {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const now = useNow(30_000)
  const { canRoute, loading: authzLoading } = useAuthz()
  const canDine = !authzLoading && canRoute("route.student.dining")
  const [, setSkipVersion] = useState(0)
  const [pending, setPending] = useState(null)
  const [chosen, setChosen] = useState(null)
  const [error, setError] = useState("")

  const portalQuery = useQuery({
    ...studentDiningPortalQuery(),
    enabled: canDine,
    refetchInterval: (query) => (query.state.data?.canSelect ? SELECTING_REFRESH_MS : false),
  })

  const choose = useChooseCaterer({
    onError: (err) => {
      setChosen(null)
      setError(getErrorMessage(err, "Couldn't choose that caterer. Please try another."))
    },
  })

  const portal = portalQuery.data || null
  const openPeriod = portal?.activeAllocationPeriod || null
  const needsChoice = Boolean(portal?.canSelect && openPeriod && !openPeriod.selectedAllocation)
  const isSkipped = skippedPeriods.has(periodKey(openPeriod))

  if (authzLoading || (canDine && portalQuery.isPending)) {
    return <LoadingPage message="Loading" />
  }

  // `chosen` keeps the screen up after the optimistic patch clears needsChoice,
  // so the student sees the confirmation before moving on.
  if (!chosen && (!needsChoice || isSkipped)) return children

  const skip = () => {
    skippedPeriods.add(periodKey(openPeriod))
    setSkipVersion((v) => v + 1)
  }
  const done = chosen && choose.isSuccess
  const continueLabel = pathname.replace(/\/+$/, "") === "/student" ? "Go to dashboard" : "Continue"

  const days = periodDays(chosen?.period || openPeriod)
  const firstName = String(user?.name || "")
    .trim()
    .split(/\s+/)[0]
  const closesIn = openPeriod?.allocationEndAt ? Date.parse(openPeriod.allocationEndAt) - now : null
  const capacities = Array.isArray(openPeriod?.catererCapacities) ? openPeriod.catererCapacities : []
  const seatsLeft = capacities.reduce((sum, entry) => sum + Math.max(0, Number(entry.remainingSeats || 0)), 0)

  return (
    <div className="sd-gate">
      <main className="sd-gate__panel" aria-live="polite">
        {done ? (
          <div className="sd-gate__done">
            <span className="sd-gate__check" aria-hidden="true">
              <CircleCheck size={30} />
            </span>
            <div>
              <h1 className="sd-gate__title">You&apos;re all set{firstName ? `, ${firstName}` : ""}</h1>
              <p className="sd-gate__text">Your caterer is allocated. You can see it any time under Dining.</p>
            </div>
            <div className="sd-gate__ticket">
              <span className="sd-choose__avatar" aria-hidden="true">
                {catererInitials(chosen.caterer?.name)}
              </span>
              <span className="sd-gate__ticket-text">
                <strong>{chosen.caterer?.name || "Your caterer"}</strong>
                <small>
                  {formatRange(chosen.period.startDate, chosen.period.endDate)}
                  {days ? ` · ${days} days` : ""}
                </small>
              </span>
            </div>
            <Button variant="primary" size="lg" onClick={() => setChosen(null)}>
              {continueLabel}
            </Button>
          </div>
        ) : (
          <>
            <header className="sd-gate__hero">
              <p className="sd-gate__eyebrow">
                <span className="sd-gate__live" aria-hidden="true" />
                {firstName ? `Hi ${firstName} · ` : ""}Dining allocation is open
              </p>
              <h1 className="sd-gate__title">Choose your caterer</h1>
              <p className="sd-gate__text">Pick where you&apos;ll eat this period. Seats go first come, first served.</p>
              <ul className="sd-gate__facts">
                <Fact
                  icon={<CalendarDays size={16} />}
                  title={formatRange(openPeriod.startDate, openPeriod.endDate)}
                  detail={days ? `${days} days` : ""}
                />
                {closesIn !== null && (
                  <Fact
                    icon={<Clock size={16} />}
                    title={`Closes in ${formatCountdown(closesIn)}`}
                    detail={formatWhen(openPeriod.allocationEndAt)}
                    tone={closesIn < URGENT_MS ? "warning" : ""}
                  />
                )}
                <Fact
                  icon={<Users size={16} />}
                  title={`${seatsLeft.toLocaleString()} seats left`}
                  detail={`across ${capacities.length} caterer${capacities.length === 1 ? "" : "s"}`}
                />
              </ul>
            </header>

            {error && (
              <Alert type="error" icon dismissible onDismiss={() => setError("")}>
                {error}
              </Alert>
            )}

            <CatererOptions
              period={openPeriod}
              selectedCatererId=""
              selectingCatererId={choose.isPending ? choose.variables?.catererId : ""}
              onSelect={(option) => {
                setError("")
                setPending(option)
              }}
            />

            <footer className="sd-gate__foot">
              <span className="sd-gate__text">You can also choose later from Dining while the window is open.</span>
              <Button variant="secondary" className="sd-gate__skip" onClick={skip} disabled={choose.isPending}>
                {continueLabel === "Go to dashboard" ? "Skip to dashboard" : "Skip for now"}
              </Button>
            </footer>
          </>
        )}
      </main>

      <ConfirmDialog
        isOpen={Boolean(pending)}
        onClose={() => setPending(null)}
        onConfirm={() => {
          const target = pending
          setPending(null)
          if (!target) return
          setChosen({ caterer: target.caterer, period: openPeriod })
          choose.mutate({
            catererId: target.catererId,
            caterer: target.caterer,
          })
        }}
        title="Choose this caterer?"
        message={`You'll eat at ${pending?.caterer?.name || "this caterer"} for the whole period. You can't change it after confirming.`}
        confirmText="Yes, choose"
      />
    </div>
  )
}

export default DiningAllocationGate
