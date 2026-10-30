// Client-side menu metrics over a range of resolved days. Everything is derived from the days the API
// returned: no extra endpoint, nothing stored.
import { addDays, formatShort, weekKeysFrom } from "./menuHelpers"

const itemsOfDay = (day) => (day.meals || []).filter((meal) => meal.served !== false).flatMap((meal) => meal.items || [])

/**
 * `days`: every resolved day from `weekStart - 49` to `weekStart + 6`.
 * The headline window is the four weeks ending with the selected week; "gone quiet" looks at the weeks
 * before the last two for dishes that have not come back.
 */
export const analyzeMenu = (days, weekStart) => {
  const windowStart = addDays(weekStart, -21)
  const recentStart = addDays(weekStart, -7)
  const byDate = new Map(days.map((day) => [day.date, day]))

  const counts = new Map()
  const lastSeen = new Map()
  let slots = 0
  let specials = 0
  const specialNames = new Map()

  const weeks = [-21, -14, -7, 0].map((offset) => {
    const start = addDays(weekStart, offset)
    let nonveg = 0
    let egg = 0
    let withMenu = 0
    for (const key of weekKeysFrom(start)) {
      const items = byDate.has(key) ? itemsOfDay(byDate.get(key)) : []
      if (items.length) withMenu += 1
      if (items.some((item) => item.diet === "nonveg")) nonveg += 1
      if (items.some((item) => item.diet === "egg")) egg += 1
    }
    return { start, label: formatShort(start), nonveg, egg, withMenu }
  })

  for (const day of days) {
    const items = itemsOfDay(day)
    for (const item of items) {
      const key = item.name.toLowerCase()
      if (!lastSeen.has(key) || lastSeen.get(key).date < day.date) lastSeen.set(key, { name: item.name, date: day.date })
      if (day.date < windowStart) continue
      slots += 1
      const entry = counts.get(key) || { name: item.name, count: 0 }
      entry.count += 1
      counts.set(key, entry)
      if (item.special) {
        specials += 1
        specialNames.set(key, item.name)
      }
    }
  }

  const repeated = [...counts.values()]
    .filter((entry) => entry.count > 1)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 8)

  const quiet = [...lastSeen.entries()]
    .filter(([, seen]) => seen.date < recentStart)
    .map(([, seen]) => seen)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 12)

  // Meals that are open this week but have no dishes yet.
  let openMeals = 0
  let filledMeals = 0
  for (const key of weekKeysFrom(weekStart)) {
    for (const meal of byDate.get(key)?.meals || []) {
      if (meal.served === false) continue
      openMeals += 1
      if ((meal.items || []).length) filledMeals += 1
    }
  }

  return {
    slots,
    distinct: counts.size,
    variety: slots ? counts.size / slots : 0,
    repeated,
    weeks,
    specials,
    specialNames: [...specialNames.values()].slice(0, 6),
    quiet,
    openMeals,
    filledMeals,
  }
}
