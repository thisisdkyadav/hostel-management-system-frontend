// Screenshot / dev fixture for the admin dining insights endpoint (contract v1).
// NEVER import this from app code. It exists only for throwaway harnesses.
// Deterministic: same output every call. "Today" is Fri 9 Oct 2026, about 13:05 local.

const TODAY = "2026-10-09"
const TZ_OFFSET = "+05:30"

const SLOTS = [
  { key: "breakfast", name: "Breakfast", startTime: "07:30", endTime: "09:30" },
  { key: "lunch", name: "Lunch", startTime: "12:00", endTime: "14:30" },
  { key: "snacks", name: "Snacks", startTime: "17:00", endTime: "18:00" },
  { key: "dinner", name: "Dinner", startTime: "19:30", endTime: "22:00" },
]

const CATERERS = [
  { id: "c1", name: "Annapurna Caterers", allocated: 520, rebate: 58, quality: 0.9 },
  { id: "c2", name: "Green Leaf Kitchen", allocated: 430, rebate: 44, quality: 1.04 },
  { id: "c3", name: "Maa Ki Rasoi", allocated: 380, rebate: 33, quality: 0.78 },
  { id: "c4", name: "Spice Route Foods", allocated: 470, rebate: 51, quality: 0.97 },
]

// Base attendance (share of expected students who eat) per meal, then a weekday modifier.
const BASE = { breakfast: 0.6, lunch: 0.9, snacks: 0.42, dinner: 0.93 }
const WEEKDAY_MOD = {
  breakfast: [0.62, 1.08, 1.1, 1.08, 1.06, 0.98, 0.9], // Sun..Sat
  lunch: [0.93, 1.03, 1.04, 1.03, 1.02, 0.98, 0.92],
  snacks: [0.85, 1.05, 1.05, 1.0, 1.02, 0.95, 0.9],
  dinner: [0.98, 1.0, 1.01, 1.02, 1.0, 0.96, 1.03],
}

// Deterministic noise.
const rng = (seed) => {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const parse = (key) => {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(y, m - 1, d)
}
const keyOf = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
const addDays = (key, n) => {
  const d = parse(key)
  d.setDate(d.getDate() + n)
  return keyOf(d)
}
const toMin = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + m
}

// Arrival-time shapes: mixtures of Gaussians over minutes since midnight, per meal.
const SHAPES = {
  breakfast: [
    { w: 0.55, mu: 8 * 60 + 25, sd: 28 },
    { w: 0.3, mu: 9 * 60 + 5, sd: 16 },
    { w: 0.15, mu: 7 * 60 + 50, sd: 12 },
  ],
  lunch: [
    { w: 0.62, mu: 13 * 60 + 12, sd: 17 },
    { w: 0.25, mu: 12 * 60 + 40, sd: 14 },
    { w: 0.13, mu: 13 * 60 + 50, sd: 20 },
  ],
  snacks: [
    { w: 0.7, mu: 17 * 60 + 18, sd: 11 },
    { w: 0.3, mu: 17 * 60 + 42, sd: 9 },
  ],
  dinner: [
    { w: 0.5, mu: 20 * 60 + 15, sd: 22 },
    { w: 0.32, mu: 21 * 60, sd: 20 },
    { w: 0.18, mu: 19 * 60 + 45, sd: 10 },
  ],
}

const density = (shape, x) =>
  shape.reduce((sum, c) => sum + (c.w * Math.exp(-0.5 * ((x - c.mu) / c.sd) ** 2)) / (c.sd * Math.sqrt(2 * Math.PI)), 0)

const buildPeak = (slot, avgDailyVerified, activeDays) => {
  const start = toMin(slot.startTime) - 30
  const end = Math.min(1435, toMin(slot.endTime) + 30)
  const shape = SHAPES[slot.key]
  const raw = []
  for (let minute = start; minute <= end; minute += 5) {
    // Average the density across the 5 minute bucket.
    let d = 0
    for (let k = 0; k < 5; k += 1) d += density(shape, minute + k)
    raw.push({ minute, d })
  }
  const total = raw.reduce((s, b) => s + b.d, 0)
  const buckets = raw.map((b) => ({ minute: b.minute, avgScans: Math.round(((b.d / total) * avgDailyVerified) * 10) / 10 }))
  let peak = buckets[0]
  buckets.forEach((b) => {
    if (b.avgScans > peak.avgScans) peak = b
  })
  const cumulative = (q) => {
    let run = 0
    for (const b of raw) {
      run += b.d / total
      if (run >= q) return b.minute + 2
    }
    return end
  }
  return {
    mealSlotKey: slot.key,
    bucketMinutes: 5,
    buckets,
    peakMinute: peak.minute,
    p10Minute: cumulative(0.1),
    medianMinute: cumulative(0.5),
    p90Minute: cumulative(0.9),
    activeDays,
    avgDailyVerified,
  }
}

export const makeInsightsFixture = ({ days = 30 } = {}) => {
  const rand = rng(20261009)
  const dates = []
  for (let i = days - 1; i >= 0; i -= 1) dates.push(addDays(TODAY, -i))

  const totalAllocated = CATERERS.reduce((s, c) => s + c.allocated, 0)
  const todayOnRebate = CATERERS.reduce((s, c) => s + c.rebate, 0)

  // ---- daily ----
  const daily = dates.map((date) => {
    const weekday = parse(date).getDay()
    // On-rebate drifts up around weekends and a long weekend mid window.
    const rebate = Math.round(150 + (weekday === 5 || weekday === 6 ? 38 : 0) + (weekday === 0 ? 20 : 0) + rand() * 26)
    const onRebate = date === TODAY ? todayOnRebate : rebate
    const expected = totalAllocated - onRebate
    const meals = {}
    SLOTS.forEach((slot) => {
      const mod = WEEKDAY_MOD[slot.key][weekday]
      let verified = Math.round(expected * Math.min(0.97, BASE[slot.key] * mod) * (0.965 + rand() * 0.07))
      if (date === TODAY) {
        if (slot.key === "breakfast") verified = 986
        else if (slot.key === "lunch") verified = 1038
        else verified = 0
      }
      meals[slot.key] = { verified }
    })
    const issues = date === TODAY ? 41 : Math.round(34 + rand() * 38)
    return { date, allocated: totalAllocated, onRebate, expected, meals, issues }
  })

  // ---- peaks ----
  const peaks = SLOTS.map((slot) => {
    const finished = daily.filter((d) => d.date !== TODAY || slot.key === "breakfast")
    const values = finished.map((d) => d.meals[slot.key].verified).filter((v) => v > 0)
    const avg = values.length ? Math.round(values.reduce((s, v) => s + v, 0) / values.length) : 0
    return buildPeak(slot, avg, values.length)
  })

  // ---- weekday heat ----
  const weekdayHeat = []
  for (let wd = 0; wd < 7; wd += 1) {
    SLOTS.forEach((slot) => {
      const rows = daily.filter((d) => parse(d.date).getDay() === wd && (d.date !== TODAY || slot.key === "breakfast"))
      const rates = rows.map((d) => d.meals[slot.key].verified / d.expected)
      weekdayHeat.push({
        weekday: wd,
        mealSlotKey: slot.key,
        attendanceRate: rates.length ? rates.reduce((s, r) => s + r, 0) / rates.length : null,
        samples: rates.length,
      })
    })
  }

  // ---- caterers ----
  const share = (c) => c.allocated / totalAllocated
  const todayDone = { breakfast: [1, 0.64], lunch: [1, 0.72] }
  const caterers = CATERERS.map((c) => {
    const expected = c.allocated - c.rebate
    const today = {}
    SLOTS.forEach((slot) => {
      let verified = 0
      if (slot.key === "breakfast") verified = Math.round(expected * 0.6 * c.quality)
      if (slot.key === "lunch") verified = Math.round(expected * 0.69 * c.quality)
      today[slot.key] = { verified }
    })
    void todayDone
    const attendance = Math.min(0.96, 0.775 * c.quality + (c.quality > 1 ? 0.02 : 0))
    return {
      id: c.id,
      name: c.name,
      allocated: c.allocated,
      todayOnRebate: c.rebate,
      todayExpected: expected,
      today,
      attendanceRate: Math.round(attendance * 1000) / 1000,
      rebateShare: Math.round((0.1 + (c.id === "c3" ? 0.035 : 0) - (c.id === "c2" ? 0.012 : 0)) * 1000) / 1000,
      issueRate: Math.round((0.028 + (c.id === "c3" ? 0.034 : c.id === "c1" ? 0.011 : 0) - (c.id === "c2" ? 0.01 : 0)) * 1000) / 1000,
      faceShare: Math.round((0.72 + (c.id === "c4" ? 0.12 : 0) - (c.id === "c3" ? 0.31 : 0) + (c.id === "c2" ? 0.06 : 0)) * 1000) / 1000,
      unusedPlates7d: Math.round(share(c) * 1240 * (c.id === "c3" ? 1.5 : c.id === "c2" ? 0.62 : c.id === "c1" ? 1.0 : 0.82)),
    }
  }).sort((a, b) => a.name.localeCompare(b.name))

  // ---- forecast ----
  const onRebate = [186, 192, 201, 215, 248, 262, 240, 198, 188, 175, 168, 210, 233, 205]
  const pending = [14, 12, 18, 22, 31, 27, 19, 9, 6, 11, 14, 17, 12, 8]
  const rebateForecast = onRebate.map((value, i) => {
    const prev = i === 0 ? 178 : onRebate[i - 1]
    const delta = value - prev
    const returning = Math.max(3, Math.round(14 + rand() * 20 - Math.max(0, delta) * 0.1))
    const starting = Math.max(0, delta + returning)
    return { date: addDays(TODAY, i), onRebate: value, pending: pending[i], starting, returning }
  })

  // ---- scanner ----
  const verifiedInWindow = daily.reduce((s, d) => s + Object.values(d.meals).reduce((m, x) => m + x.verified, 0), 0)
  const scanner = {
    verified: verifiedInWindow,
    issues: {
      duplicate: 1184,
      "wrong-caterer": 462,
      "outside-meal-time": 391,
      "on-rebate": 268,
      "not-allocated": 174,
      "unknown-student": 62,
      "no-active-period": 9,
    },
    bySource: { manual: Math.round(verifiedInWindow * 0.26), "face-scanner": Math.round(verifiedInWindow * 0.74) },
  }

  const mealAvg = (key) => {
    const rows = weekdayHeat.filter((r) => r.mealSlotKey === key && r.attendanceRate !== null)
    return rows.reduce((s, r) => s + r.attendanceRate, 0) / rows.length
  }
  const ranked = SLOTS.map((s) => ({ mealSlotKey: s.key, attendanceRate: mealAvg(s.key) })).sort((a, b) => b.attendanceRate - a.attendanceRate)
  let busiest = { date: "", mealSlotKey: "", verified: 0 }
  daily.forEach((d) => {
    SLOTS.forEach((s) => {
      if (d.date !== TODAY && d.meals[s.key].verified > busiest.verified) busiest = { date: d.date, mealSlotKey: s.key, verified: d.meals[s.key].verified }
    })
  })

  return {
    generatedAt: `${TODAY}T13:05:00${TZ_OFFSET}`,
    today: TODAY,
    from: dates[0],
    to: TODAY,
    days,
    timezone: "Asia/Kolkata",
    totals: {
      caterers: CATERERS.length,
      allocatedStudents: totalAllocated,
      todayOnRebate,
      pendingRebates: 37,
      currentPeriod: { id: "p-oct", startDate: "2026-08-01", endDate: "2026-12-20" },
    },
    mealSlots: SLOTS,
    currentMealSlotKey: "lunch",
    peaks,
    weekdayHeat,
    daily,
    caterers,
    rebateForecast,
    scanner,
    students: { regulars: 612, ghosts: 74, neverScanned: 41 },
    records: {
      busiestMeal: busiest,
      busiestMinute: { at: `2026-10-06T13:06:00${TZ_OFFSET}`, scans: 27 },
      bestAttendedMeal: ranked[0],
      leastAttendedMeal: ranked[ranked.length - 1],
    },
  }
}

export const insightsFixture = makeInsightsFixture()

export const dashboardDiningFixture = {
  today: { allocated: 1800, verified: 1038, pending: 576, onRebate: 186, mealSlot: "Lunch" },
  rebates: { pending: 37, approvedToday: 186, upcoming: 412 },
  billing: { totalAllocated: 8640000, totalCharged: 5128400, totalOutstanding: 1342600, duesCount: 128 },
}
