import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { CalendarDays, Check, ChevronRight, Clock, FileSignature, Plane, Plus, ShieldCheck, Star, Vote, X } from "lucide-react"
import { useToast } from "hzero"
import { useAuth } from "../../../contexts/AuthProvider"
import { electionsApi, studentApi, undertakingApi } from "../../../service"
import { queryKeys } from "../../../lib/query"
import { addDays, clock12, formatCountdown, mealPaletteFor, mealProgress, mealVarsFor, nowParts, slotKey, timeSpan, toMinutes, weekStartOf } from "../../dining/menu/menuHelpers"
import { useNow, useStudentMenuWeek } from "../../dining/student/useStudentMenu"
import ComplaintSheet from "./ComplaintSheet"
import NewComplaintSheet from "./NewComplaintSheet"
import { isOpenComplaint, statusMeta, StatusTrack, timeAgo } from "./complaintBits"

const DASHBOARD_CACHE_KEY = "student_dashboard_data"

const normalize = (payload) => {
  const candidate = payload && typeof payload === "object" && payload.data && typeof payload.data === "object" ? payload.data : payload
  return candidate && typeof candidate === "object" && candidate.profile ? candidate : null
}

const readCache = () => {
  try {
    return normalize(JSON.parse(localStorage.getItem(DASHBOARD_CACHE_KEY) || "null")?.data)
  } catch {
    return null
  }
}

const greeting = (hour) => (hour < 5 ? "Good night" : hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening")

const isBirthday = (dob, now) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(dob || ""))
  return Boolean(match) && Number(match[2]) === now.getMonth() + 1 && Number(match[3]) === now.getDate()
}

const MEAL_ICON = { ate: Check, missed: X, away: Plane, upcoming: Clock }

/* ---------- the meal hero ---------- */

const useMealFocus = (now) => {
  const { key: today, minutes } = nowParts(now)
  const week = useStudentMenuWeek(weekStartOf(today))
  const days = week.data?.days || []
  const day = days.find((item) => item.date === today) || null
  const tomorrow = days.find((item) => item.date === addDays(today, 1)) || null
  const meals = useMemo(() => day?.meals || [], [day])
  const progress = useMemo(() => mealProgress(meals, minutes), [meals, minutes])
  const palette = useMemo(() => mealPaletteFor(meals.map((meal) => ({ name: meal.name }))), [meals])

  if (week.isPending && !week.data) return { state: "loading" }
  if (!day?.caterer) return { state: "none" }
  if (progress.current) {
    const { meal, start, end } = progress.current
    return { state: "now", meal, vars: mealVarsFor(palette, slotKey(meal.name)), fraction: (minutes - start) / Math.max(end - start, 1), line: `until ${clock12(meal.endTime)}`, next: progress.next }
  }
  if (progress.next) {
    const { meal, start } = progress.next
    return { state: "next", meal, vars: mealVarsFor(palette, slotKey(meal.name)), line: `in ${formatCountdown(start - minutes)} · ${timeSpan(meal)}` }
  }
  const first = (tomorrow?.meals || []).filter((meal) => meal.served !== false).sort((a, b) => (toMinutes(a.startTime) ?? 0) - (toMinutes(b.startTime) ?? 0))[0]
  if (first && tomorrow?.caterer) {
    const tomorrowPalette = mealPaletteFor((tomorrow.meals || []).map((meal) => ({ name: meal.name })))
    return { state: "tomorrow", meal: first, vars: mealVarsFor(tomorrowPalette, slotKey(first.name)), line: `tomorrow · ${timeSpan(first)}` }
  }
  return { state: "done" }
}

const MealHero = ({ now, todayMeals }) => {
  const navigate = useNavigate()
  const focus = useMealFocus(now)
  const label = { now: "Now serving", next: "Up next", tomorrow: "First up tomorrow" }[focus.state]
  const items = (focus.meal?.items || []).map((item) => item.name)

  return (
    <button type="button" className="mh-meal" data-state={focus.state} style={focus.vars} onClick={() => navigate("/student/dining")}>
      {focus.meal ? (
        <>
          <span className="mh-meal__top">
            <span className="mh-meal__label">
              {focus.state === "now" && <span className="mh-live" aria-hidden="true" />}
              {label}
            </span>
            <ChevronRight size={18} aria-hidden="true" />
          </span>
          <span className="mh-meal__name">{focus.meal.name}</span>
          <span className="mh-meal__line">{focus.line}</span>
          {focus.state === "now" && (
            <span className="mh-meal__bar" aria-hidden="true">
              <span style={{ width: `${Math.round(Math.min(Math.max(focus.fraction, 0), 1) * 100)}%` }} />
            </span>
          )}
          <span className="mh-meal__dishes">{items.length ? items.join(" · ") : focus.meal.note || "Menu not posted yet"}</span>
        </>
      ) : (
        <>
          <span className="mh-meal__top">
            <span className="mh-meal__label">Dining</span>
            <ChevronRight size={18} aria-hidden="true" />
          </span>
          <span className="mh-meal__name mh-meal__name--sm">
            {focus.state === "loading" ? "Loading the menu…" : focus.state === "done" ? "That's all for today" : "No menu right now"}
          </span>
          <span className="mh-meal__line">{focus.state === "none" ? "Your menu shows here once you have a caterer." : "See your meals and the week's menu."}</span>
        </>
      )}
      {todayMeals?.length > 0 && (
        <span className="mh-today" aria-label="Today's meals">
          {todayMeals.map((meal) => {
            const Icon = MEAL_ICON[meal.status] || Clock
            return (
              <span key={meal.key} className="mh-today__item" data-status={meal.status} title={meal.name}>
                {meal.status === "serving" ? <span className="mh-live" aria-hidden="true" /> : <Icon size={12} strokeWidth={3} aria-hidden="true" />}
                {meal.name}
              </span>
            )
          })}
        </span>
      )}
    </button>
  )
}

/* ---------- page ---------- */

/**
 * Home on a phone: one screen, no scrolling for the essentials. What's next to
 * eat, where your complaints stand, and your room; anything that needs you
 * (a vote, an undertaking, rating a fix) sits on top.
 */
const PhoneHome = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { isOnline } = useAuth()
  const now = useNow()
  const [openComplaint, setOpenComplaint] = useState(null)
  const [creating, setCreating] = useState(false)

  const dashboardQuery = useQuery({
    queryKey: queryKeys.studentDashboard.data(),
    queryFn: async () => {
      const data = normalize(await studentApi.getStudentDashboard())
      if (!data) throw new Error("Student dashboard response is missing profile data")
      try {
        localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify({ data, timestamp: new Date().toISOString() }))
      } catch {
        /* storage full or blocked */
      }
      return data
    },
    enabled: isOnline,
  })
  const data = dashboardQuery.data ?? (dashboardQuery.isError || !isOnline ? readCache() : null)

  const mealsQuery = useQuery({ queryKey: queryKeys.dining.meals(), queryFn: () => studentApi.getDiningMeals(), retry: false })
  const todayMeals = mealsQuery.data?.period ? mealsQuery.data.todayMeals : []

  const votingQuery = useQuery({
    queryKey: queryKeys.studentDashboard.activeVotingElection(),
    queryFn: () => electionsApi.getStudentCurrent(),
    enabled: isOnline,
  })
  const voting = (votingQuery.data?.data?.elections || []).find((election) => election?.mode === "voting") || null

  const undertakingsQuery = useQuery({
    queryKey: ["undertakings", "pending-count"],
    queryFn: () => undertakingApi.pendingUndertakingsCount(),
    enabled: isOnline,
    retry: false,
  })
  const pendingUndertakings = undertakingsQuery.data?.count || 0

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.studentDashboard.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.complaints.all })
  }

  const stats = data?.stats?.complaints || {}
  const active = (data?.activeComplaints || []).filter(isOpenComplaint)
  const openCount = Math.max((stats.pending || 0) + (stats.inProgress || 0), active.length)
  const toRate = data?.resolvedComplaintsWithoutFeedback?.[0] || null
  const room = data?.roomInfo || null
  const events = (data?.upcomingEvents || []).slice(0, 3)
  const insurance = data?.insurance || null

  const todo = [
    voting && { key: "vote", icon: Vote, tone: "success", text: `Voting is open${voting.title ? `: ${voting.title}` : ""}`, onClick: () => navigate("/student/elections") },
    pendingUndertakings > 0 && {
      key: "undertakings",
      icon: FileSignature,
      tone: "warning",
      text: pendingUndertakings === 1 ? "1 undertaking to accept" : `${pendingUndertakings} undertakings to accept`,
      onClick: () => navigate("/student/undertakings"),
    },
    toRate && { key: "rate", icon: Star, tone: "info", text: `Rate the fix: ${toRate.title}`, onClick: () => setOpenComplaint(toRate) },
  ].filter(Boolean)

  const birthday = isBirthday(data?.profile?.dateOfBirth, now)

  return (
    <div className="mk-page mh">
      <header className="mh-hello">
        <span className="mh-hello__date">{now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</span>
        <h1 className="mh-hello__text">{birthday ? "Happy birthday 🎂" : greeting(now.getHours())}</h1>
      </header>

      {todo.length > 0 && (
        <ul className="mh-todo">
          {todo.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.key}>
                <button type="button" className="mh-todo__item" data-tone={item.tone} onClick={item.onClick}>
                  <Icon size={16} aria-hidden="true" />
                  <span>{item.text}</span>
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <MealHero now={now} todayMeals={todayMeals} />

      <section className="mh-block" aria-label="Your complaints">
        <div className="mh-complaints">
          <button type="button" className="mh-count" onClick={() => navigate("/student/complaints")}>
            <span className="mh-count__n" data-zero={openCount === 0 || undefined}>
              {dashboardQuery.isPending && !data ? "–" : openCount}
            </span>
            <span className="mh-count__label">{openCount === 1 ? "open complaint" : "open complaints"}</span>
          </button>
          <div className="mh-complaints__list">
            {active.slice(0, 2).map((complaint) => {
              const meta = statusMeta(complaint.status)
              return (
                <button key={complaint.id} type="button" className="mh-c" onClick={() => setOpenComplaint(complaint)}>
                  <span className="mh-c__title">{complaint.title}</span>
                  <span className="mh-c__meta" data-tone={meta.tone}>
                    <StatusTrack status={complaint.status} />
                    {meta.label} · {timeAgo(complaint.createdDate)}
                  </span>
                </button>
              )
            })}
            {active.length === 0 && !dashboardQuery.isPending && <p className="mh-allclear">All clear. Nothing waiting on a fix.</p>}
          </div>
        </div>
        <button type="button" className="mh-raise" onClick={() => setCreating(true)}>
          <Plus size={18} strokeWidth={2.5} aria-hidden="true" />
          Raise a complaint
        </button>
      </section>

      {room && (
        <section className="mh-room" aria-label="Your room">
          <span className="mh-room__tag">
            <span className="mh-room__tag-hole" aria-hidden="true" />
            <span className="mh-room__no">{room.roomNumber}</span>
          </span>
          <span className="mh-room__info">
            <span className="mh-room__hostel">{room.hostelName}</span>
            <span className="mh-room__beds">
              {(room.beds || []).map((bed) => (
                <i key={bed.id} data-on={bed.isOccupied || undefined} data-me={bed.isCurrentUser || undefined} title={bed.isCurrentUser ? "You" : bed.isOccupied ? "Taken" : "Free"} />
              ))}
              <span>
                {room.roommates?.length
                  ? `with ${room.roommates.map((mate) => String(mate.name || "").split(" ")[0]).join(", ")}`
                  : room.totalBeds > 1
                    ? "no roommates yet"
                    : "single room"}
              </span>
            </span>
          </span>
        </section>
      )}

      {(events.length > 0 || insurance) && (
        <section className="mh-extra">
          {events.length > 0 && (
            <>
              <h2 className="mk-label">Coming up</h2>
              <ul className="mh-events">
                {events.map((event) => {
                  const when = new Date(event.dateAndTime)
                  return (
                    <li key={event._id}>
                      <button type="button" className="mh-event" onClick={() => navigate("/student/events")}>
                        <span className="mh-event__date">
                          <b>{when.getDate()}</b>
                          {when.toLocaleDateString("en-IN", { month: "short" })}
                        </span>
                        <span className="mh-event__main">
                          <span className="mh-event__name">{event.eventName}</span>
                          <span className="mk-sub">{when.toLocaleString("en-IN", { weekday: "short", hour: "numeric", minute: "2-digit" })}</span>
                        </span>
                        <CalendarDays size={16} aria-hidden="true" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
          {insurance && (
            <div className="mh-insure">
              <ShieldCheck size={18} aria-hidden="true" />
              <span className="mh-insure__text">
                <span>{insurance.provider?.name || "Health insurance"}</span>
                {insurance.insuranceNumber && <span className="mk-sub">Policy {insurance.insuranceNumber}</span>}
              </span>
            </div>
          )}
        </section>
      )}

      {openComplaint && <ComplaintSheet complaint={openComplaint} onClose={() => setOpenComplaint(null)} onChanged={refresh} />}
      {creating && (
        <NewComplaintSheet
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false)
            refresh()
            toast.success("Complaint sent. Track it under Complaints.")
          }}
        />
      )}
    </div>
  )
}

export default PhoneHome
