import { useMemo, useState } from "react"
import { Button } from "hzero"
import { CalendarRange, ChevronLeft, ChevronRight, UtensilsCrossed } from "lucide-react"
import { localTodayKey } from "../caterer/catererHelpers"
import { DietLegend, ItemList } from "../menu/MenuBits"
import {
  addDays,
  clock12,
  formatCountdown,
  formatDayShort,
  formatLong,
  mealPaletteFor,
  mealProgress,
  mealVarsFor,
  nowParts,
  slotKey,
  timeSpan,
  toMinutes,
  weekStartOf,
} from "../menu/menuHelpers"
import FullWeekModal from "./FullWeekModal"
import { useNow, useStudentMenuWeek } from "./useStudentMenu"
import "../menu/Menu.css"

const dayLabel = (key, today) => {
  if (key === today) return "Today"
  if (key === addDays(today, 1)) return "Tomorrow"
  if (key === addDays(today, -1)) return "Yesterday"
  return formatDayShort(key)
}

/**
 * The student's menu for one day, today by default: dishes per meal, the meal being served (or the next
 * one) highlighted with a countdown, ‹ › to step through days, and a "Full week" board.
 */
const MenuCard = () => {
  const now = useNow()
  const { key: localKey, minutes } = nowParts(now)
  const [dateKey, setDateKey] = useState(() => localTodayKey())
  const [weekOpen, setWeekOpen] = useState(false)

  const weekStart = weekStartOf(dateKey)
  const query = useStudentMenuWeek(weekStart)
  const today = query.data?.today || localKey
  const day = query.data?.days?.find((item) => item.date === dateKey) || null
  const isToday = dateKey === today

  const meals = useMemo(() => day?.meals || [], [day])
  const palette = useMemo(() => mealPaletteFor(meals.map((meal) => ({ name: meal.name }))), [meals])
  const progress = useMemo(() => (isToday ? mealProgress(meals, minutes) : { current: null, next: null }), [isToday, meals, minutes])
  const listed = meals.some((meal) => meal.served !== false && meal.items?.length)

  const nowLine = progress.current ? `${progress.current.meal.name} · now, until ${clock12(progress.current.meal.endTime)}` : ""
  const nextLine = progress.next ? `${progress.next.meal.name} in ${formatCountdown(progress.next.start - minutes)}` : ""
  const allDone = isToday && meals.some((meal) => meal.served !== false) && !progress.current && !progress.next

  const stateOf = (meal) => {
    if (!isToday || meal.served === false) return "idle"
    if (progress.current?.meal === meal) return "now"
    if (progress.next?.meal === meal) return "next"
    const end = toMinutes(meal.endTime)
    return end !== null && minutes >= end ? "done" : "idle"
  }

  const renderBody = () => {
    if (query.isPending && !query.data) return <p className="sd-card__empty">Loading the menu...</p>
    if (query.isError && !query.data) return <p className="sd-card__empty">Couldn&apos;t load the menu right now.</p>
    if (!day || meals.length === 0) {
      return (
        <div className="sm-empty">
          <UtensilsCrossed size={24} aria-hidden="true" />
          <p className="sd-card__note">No meals are scheduled for this day.</p>
        </div>
      )
    }
    if (!day.caterer) {
      return (
        <div className="sm-empty">
          <UtensilsCrossed size={24} aria-hidden="true" />
          <p className="sd-card__note">The menu will show here once you have a caterer for this day.</p>
        </div>
      )
    }
    return (
      <>
        {(nowLine || nextLine) && (
          <p className="sm-status" role="status">
            <UtensilsCrossed size={15} aria-hidden="true" />
            <span>{nowLine || nextLine}</span>
            {nowLine && nextLine && <span className="sm-status__next">{nextLine}</span>}
          </p>
        )}
        {allDone && (
          <p className="sm-status" data-quiet>
            That&apos;s all the meals for today.
          </p>
        )}
        {listed ? (
          <>
            <ul className="sm-meals">
              {meals.map((meal) => {
                const state = stateOf(meal)
                return (
                  <li key={slotKey(meal.name)} className="sm-meal" data-state={state} style={mealVarsFor(palette, slotKey(meal.name))}>
                    <div className="sm-meal__head">
                      <span className="sm-meal__name">{meal.name}</span>
                      {timeSpan(meal) && <span className="sm-meal__time">{timeSpan(meal)}</span>}
                      {state === "now" && <span className="sm-meal__tag">Now</span>}
                      {state === "next" && <span className="sm-meal__tag">Up next</span>}
                    </div>
                    <div className="sm-meal__body">
                      {meal.served === false ? (
                        <p className="sm-meal__empty">Not served</p>
                      ) : meal.items?.length ? (
                        <>
                          <ItemList items={meal.items} />
                          {meal.note && <p className="sm-meal__note">{meal.note}</p>}
                        </>
                      ) : (
                        <p className="sm-meal__empty">Not listed yet</p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
            <DietLegend />
          </>
        ) : (
          <p className="sd-card__empty">The menu for this day hasn&apos;t been posted yet.</p>
        )}
      </>
    )
  }

  return (
    <section className="sd-card" aria-label="Menu">
      <header className="sm-head">
        <h2 className="sd-card__title">Menu</h2>
        <div className="sm-stepper">
          <button type="button" className="dm-iconbtn" onClick={() => setDateKey(addDays(dateKey, -1))} aria-label="Previous day">
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="sm-stepper__label"
            onClick={() => setDateKey(today)}
            disabled={isToday}
            title={isToday ? undefined : "Back to today"}
          >
            {dayLabel(dateKey, today)}
          </button>
          <button type="button" className="dm-iconbtn" onClick={() => setDateKey(addDays(dateKey, 1))} aria-label="Next day">
            <ChevronRight size={18} />
          </button>
        </div>
      </header>
      <p className="sd-card__note">
        {formatLong(dateKey)}
        {day?.caterer?.name ? ` · ${day.caterer.name}` : ""}
      </p>

      {renderBody()}

      <Button type="button" variant="secondary" size="sm" onClick={() => setWeekOpen(true)}>
        <CalendarRange size={14} /> Full week
      </Button>

      {weekOpen && <FullWeekModal initialWeekStart={weekStart} onClose={() => setWeekOpen(false)} />}
    </section>
  )
}

export default MenuCard
