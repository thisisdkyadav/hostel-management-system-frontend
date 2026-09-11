/**
 * Admin sidebar display modes.
 *
 * v1 — "All tabs": one grouped, filterable list (no category switching)
 * v2 — "Categories": bottom category bar + pinned Home (default)
 * v3 — "Workspace": quick jump + pinned + recents + collapsible categories
 * v4 — "Icon rail": v2 categories/pins, with the bar + profile in a left rail
 */
export const SIDEBAR_MODE_FLAT = "v1"
export const SIDEBAR_MODE_CATEGORIES = "v2"
export const SIDEBAR_MODE_WORKSPACE = "v3"
export const SIDEBAR_MODE_RAIL = "v4"

export const SIDEBAR_MODE_STORAGE_KEY = "admin_sidebar_mode"
export const SIDEBAR_DEFAULT_MODE = SIDEBAR_MODE_RAIL

/** Force V4 on every load through the end of 31 December 2026 (local time). */
export const V4_FORCE_UNTIL = new Date(2027, 0, 1)

/** Pre-mode boolean toggle ("true" meant the old flat nav). Read once for migration. */
export const LEGACY_SIDEBAR_TOGGLE_KEY = "admin_sidebar_legacy_enabled"

export const SIDEBAR_MODE_OPTIONS = [
  {
    id: SIDEBAR_MODE_FLAT,
    label: "V1",
    name: "All tabs",
    description: "Everything in one grouped list with a quick filter",
  },
  {
    id: SIDEBAR_MODE_CATEGORIES,
    label: "V2",
    name: "Categories",
    description: "Category bar at the bottom, pinned tabs on Home",
  },
  {
    id: SIDEBAR_MODE_WORKSPACE,
    label: "V3",
    name: "Workspace",
    description: "Pinned, recents and Ctrl+K quick jump",
  },
  {
    id: SIDEBAR_MODE_RAIL,
    label: "V4",
    name: "Icon rail",
    description: "Category icons on the left; profile and theme sit with them",
  },
]

export const isValidSidebarMode = (value) => SIDEBAR_MODE_OPTIONS.some((option) => option.id === value)

export const isV4ForceActive = (now = new Date()) => now < V4_FORCE_UNTIL

const readLegacyMigratedMode = () => {
  if (typeof window === "undefined") return null
  const legacyValue = window.localStorage.getItem(LEGACY_SIDEBAR_TOGGLE_KEY)
  if (legacyValue === null) return null
  const migratedMode = legacyValue === "true" ? SIDEBAR_MODE_FLAT : SIDEBAR_DEFAULT_MODE
  window.localStorage.setItem(SIDEBAR_MODE_STORAGE_KEY, migratedMode)
  window.localStorage.removeItem(LEGACY_SIDEBAR_TOGGLE_KEY)
  return migratedMode
}

export const readLocalSidebarMode = () => {
  if (typeof window === "undefined") return null
  const storedMode = window.localStorage.getItem(SIDEBAR_MODE_STORAGE_KEY)
  if (isValidSidebarMode(storedMode)) return storedMode
  return readLegacyMigratedMode()
}

/**
 * Resolve which layout to show.
 * During the V4 force window, always V4.
 * After that: database preference, then localStorage, then V4 for new users.
 */
export const resolveSidebarMode = ({ dbMode, storedMode } = {}) => {
  if (isV4ForceActive()) return SIDEBAR_MODE_RAIL
  if (isValidSidebarMode(dbMode)) return dbMode
  if (isValidSidebarMode(storedMode)) return storedMode
  return SIDEBAR_DEFAULT_MODE
}

export const readStoredSidebarMode = () => resolveSidebarMode({ storedMode: readLocalSidebarMode() })
