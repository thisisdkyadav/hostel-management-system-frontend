import { useEffect, useMemo, useRef, useState } from "react"
import { UtensilsCrossed } from "lucide-react"
import { localTodayKey } from "../../dining/caterer/catererHelpers"
import { ItemList, LastWeekTurnout } from "../../dining/menu/MenuBits"
import { addDays, clock12, formatCountdown, fromKey, mealPaletteFor, mealProgress, mealVarsFor, nowParts, slotKey, timeSpan, toMinutes, weekStartOf } from "../../dining/menu/menuHelpers"
import { useNow, useStudentMenuWeek } from "../../dining/student/useStudentMenu"
import "../../dining/menu/Menu.css"

/** Two weeks of day chips: this week and next, today first in view. */
const DayStrip = ({ days, value, today, onChange }) => {
  const ref = useRef(null)
  useEffect(() => {
    const active = ref.current?.querySelector("[data-active]")
    active?.scrollIntoView({ block: "nearest", inline: "center" })
  }, [value])
  return (
    <div className="mm-days" ref={ref} role="tablist" aria-label="Day">
      {days.map((key) => {
        const date = fromKey(key)
        return (
          <button key={key} type="button" role="tab" aria-selected={key === value} className="mm-day" data-active={key === value || undefined} data-today={key === today || undefined} onClick={() => onChange(key)}>
            <span className="mm-day__wd">{key === today ? "Today" : date.toLocaleDateString("en-IN", { weekday: "short" })}</span>
            <span className="mm-day__n">{date.getDate()}</span>
          </button>
        )
      })}
    </div>
  )
}

/** The student's menu, a day at a time; the meal being served (or next) is marked. */
const PhoneMenu = () => {
  const now = useNow()
  const { key: localKey, minutes } = nowParts(now)
  const [dateKey, setDateKey] = useState(() => localTodayKey())
  const query = useStudentMenuWeek(weekStartOf(dateKey))
  const today = query.data?.today || localKey
  const strip = useMemo(() => Array.from({ length: 14 }, (_, index) => addDays(weekStartOf(today), index)), [today])
  const day = query.data?.days?.find((item) => item.date === dateKey) || null
  const isToday = dateKey === today
  const meals = useMemo(() => day?.meals || [], [day])
  const palette = useMemo(() => mealPaletteFor(meals.map((meal) => ({ name: meal.name }))), [meals])
  const progress = useMemo(() => (isToday ? mealProgress(meals, minutes) : { current: null, next: null }), [isToday, meals, minutes])

  const stateOf = (meal) => {
    if (!isToday || meal.served === false) return "idle"
    if (progress.current?.meal === meal) return "now"
    if (progress.next?.meal === meal) return "next"
    const end = toMinutes(meal.endTime)
    return end !== null && minutes >= end ? "done" : "idle"
  }

  const body = () => {
    if (query.isPending && !query.data) return <p className="mk-sub mm-msg">Loading the menu…</p>
    if (query.isError && !query.data) return <p className="mk-sub mm-msg">Couldn&apos;t load the menu right now.</p>
    if (!day || meals.length === 0 || !day.caterer) {
      return (
        <div className="mk-empty">
          <span className="mk-empty__icon">
            <UtensilsCrossed size={26} />
          </span>
          <p className="mk-sub">{!day || meals.length === 0 ? "No meals are scheduled for this day." : "The menu shows here once you have a caterer for this day."}</p>
        </div>
      )
    }
    return (
      <ul className="mm-meals">
        {meals.map((meal) => {
          const state = stateOf(meal)
          return (
            <li key={slotKey(meal.name)} className="mm-meal" data-state={state} style={mealVarsFor(palette, slotKey(meal.name))}>
              <div className="mm-meal__head">
                <span className="mm-meal__name">{meal.name}</span>
                {state === "now" && <span className="mm-meal__tag">Now · until {clock12(meal.endTime)}</span>}
                {state === "next" && <span className="mm-meal__tag">In {formatCountdown(progress.next.start - minutes)}</span>}
                {state !== "now" && state !== "next" && timeSpan(meal) && <span className="mm-meal__time">{timeSpan(meal)}</span>}
              </div>
              {meal.served === false ? (
                <p className="mk-sub">Not served</p>
              ) : meal.items?.length ? (
                <>
                  <ItemList items={meal.items} />
                  {meal.note && <p className="mk-sub">{meal.note}</p>}
                </>
              ) : (
                <p className="mk-sub">{meal.note || "Menu not posted yet"}</p>
              )}
              <LastWeekTurnout meal={meal} mealName={meal.name.toLowerCase()} />
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className="mm">
      <DayStrip days={strip} value={dateKey} today={today} onChange={setDateKey} />
      {body()}
    </div>
  )
}

export default PhoneMenu
