import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useLocation } from "react-router-dom"
import { Alert, Button, ConfirmDialog } from "hzero"
import { CircleCheck, UtensilsCrossed } from "lucide-react"
import LoadingPage from "@/pages/LoadingPage"
import useAuthz from "@/hooks/useAuthz"
import { formatRange } from "@/components/dining/caterer/catererHelpers"
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

/**
 * While a caterer-selection window is open and the student hasn't chosen yet,
 * every app open shows this screen instead of the portal: the open period, the
 * caterers with live seats, and a way to skip to the dashboard. Anything that
 * stops it from deciding (no dining access, a failed read) falls through to
 * the portal rather than blocking the student.
 */
const DiningAllocationGate = ({ children }) => {
  const { pathname } = useLocation()
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

  return (
    <div className="sd-gate">
      <main className="sd-gate__panel" aria-live="polite">
        {done ? (
          <div className="sd-gate__done">
            <span className="sd-gate__badge" data-tone="success" aria-hidden="true">
              <CircleCheck size={28} />
            </span>
            <h1 className="sd-gate__title">You&apos;re with {chosen.caterer?.name || "your caterer"}</h1>
            <p className="sd-gate__text">
              Your caterer is allocated for {formatRange(chosen.period.startDate, chosen.period.endDate)}. You can see it any time under
              Dining.
            </p>
            <Button variant="primary" onClick={() => setChosen(null)}>
              {continueLabel}
            </Button>
          </div>
        ) : (
          <>
            <header className="sd-gate__head">
              <span className="sd-gate__badge" aria-hidden="true">
                <UtensilsCrossed size={22} />
              </span>
              <div>
                <p className="sd-gate__eyebrow">Dining allocation is open</p>
                <h1 className="sd-gate__title">Choose your caterer</h1>
                <p className="sd-gate__text">
                  For {formatRange(openPeriod.startDate, openPeriod.endDate)}
                  {openPeriod.allocationEndAt ? ` · closes ${formatWhen(openPeriod.allocationEndAt)}` : ""}. Seats update live and go first
                  come, first served.
                </p>
              </div>
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
              <Button variant="ghost" onClick={skip} disabled={choose.isPending}>
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
