// Who is looking at the caterer screens. A caterer login sees its own kitchen; Admin and the
// Dining Office (wardens and hall supervisors) see every caterer and can narrow to one.
// The same pages and components read this, so the views stay identical across portals.
import { createContext, useContext } from "react"
import { catererApi, diningOversightApi } from "@/service"
import { queryKeys } from "@/lib/query"
import { CATERER_LAST_PATH_KEY, DINING_LIVE_RETURN_KEY } from "@/constants/navigationConfig"

const feedEntries = (response) => (Array.isArray(response?.entries) ? response.entries : [])

const CATERER_SCOPE = {
  oversight: false,
  home: "/caterer",
  livePath: "/caterer/live",
  lastPathKey: CATERER_LAST_PATH_KEY,
  options: () => catererApi.getMealRecordOptions(),
  optionsKey: () => queryKeys.caterer.mealRecordOptions(),
  overview: (params) => catererApi.getMealRecordOverview(params),
  overviewKey: (params) => queryKeys.caterer.mealRecordOverview(params),
  record: (params) => catererApi.getMealRecord(params),
  recordKey: (params) => queryKeys.caterer.mealRecord(params),
  // The caterer's full record is small enough to drive the live screen too (and shares the cache).
  pulse: (params) => catererApi.getMealRecord(params),
  pulseKey: (params) => queryKeys.caterer.mealRecord(params),
  // The caterer feed is already scoped to today and this kitchen; the screen keeps the open meal.
  feed: ({ limit }) => catererApi.getMealVerificationFeed({ limit }).then(feedEntries),
  feedKey: (params) => queryKeys.caterer.mealFeed(params),
}

const clean = (params) => Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""))

/** Admin or Dining Office: every caterer, under `home` ("/admin", "/dining-office"). */
export const oversightScope = ({ home, livePath, mealRecordsPath }) => ({
  oversight: true,
  home,
  livePath,
  mealRecordsPath,
  lastPathKey: DINING_LIVE_RETURN_KEY,
  options: (params = {}) => diningOversightApi.getMealRecordOptions(clean(params)),
  optionsKey: (params = {}) => queryKeys.diningOversight.mealRecordOptions(clean(params)),
  overview: (params) => diningOversightApi.getMealRecordOverview(clean(params)),
  overviewKey: (params) => queryKeys.diningOversight.mealRecordOverview(clean(params)),
  record: (params) => diningOversightApi.getMealRecord(clean(params)),
  recordKey: (params) => queryKeys.diningOversight.mealRecord(clean(params)),
  pulse: (params) => diningOversightApi.getMealPulse(clean(params)),
  pulseKey: (params) => queryKeys.diningOversight.mealPulse(clean(params)),
  feed: (params) => diningOversightApi.getMealFeed(clean(params)).then(feedEntries),
  feedKey: (params) => queryKeys.diningOversight.mealFeed(clean(params)),
})

export const DiningScopeContext = createContext(CATERER_SCOPE)

export const useDiningScope = () => useContext(DiningScopeContext)

/* ---------- caterer colours ---------- */

// Green and red come last: on the live screen they already mean "verified" and "issue".
const SERIES_ORDER = [1, 2, 5, 3, 4, 8, 6, 7]

/** A steady colour per caterer (by its place in the name-sorted list), from the chart series tokens. */
export const buildCatererPalette = (caterers = []) => {
  const palette = new Map()
  caterers.forEach((caterer, index) => {
    palette.set(caterer.id, `var(--color-series-${SERIES_ORDER[index % SERIES_ORDER.length]})`)
  })
  return palette
}

export const catererColor = (palette, id) => palette?.get(id) || "var(--color-text-muted)"
