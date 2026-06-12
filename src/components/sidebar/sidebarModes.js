/**
 * Admin sidebar display modes.
 *
 * v1 — "All tabs": one grouped, filterable list (no category switching)
 * v2 — "Categories": bottom category bar + pinned Home (default)
 * v3 — "Workspace": quick jump + pinned + recents + collapsible categories
 */
export const SIDEBAR_MODE_FLAT = "v1"
export const SIDEBAR_MODE_CATEGORIES = "v2"
export const SIDEBAR_MODE_WORKSPACE = "v3"

export const SIDEBAR_MODE_STORAGE_KEY = "admin_sidebar_mode"
export const SIDEBAR_DEFAULT_MODE = SIDEBAR_MODE_CATEGORIES

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
]

export const isValidSidebarMode = (value) => SIDEBAR_MODE_OPTIONS.some((option) => option.id === value)

/** Resolve the persisted mode, migrating the old boolean toggle the first time. */
export const readStoredSidebarMode = () => {
  if (typeof window === "undefined") return SIDEBAR_DEFAULT_MODE

  const storedMode = window.localStorage.getItem(SIDEBAR_MODE_STORAGE_KEY)
  if (isValidSidebarMode(storedMode)) return storedMode

  const legacyValue = window.localStorage.getItem(LEGACY_SIDEBAR_TOGGLE_KEY)
  if (legacyValue !== null) {
    const migratedMode = legacyValue === "true" ? SIDEBAR_MODE_FLAT : SIDEBAR_DEFAULT_MODE
    window.localStorage.setItem(SIDEBAR_MODE_STORAGE_KEY, migratedMode)
    window.localStorage.removeItem(LEGACY_SIDEBAR_TOGGLE_KEY)
    return migratedMode
  }

  return SIDEBAR_DEFAULT_MODE
}
