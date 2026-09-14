/**
 * Admin sidebar display modes.
 *
 * v1 — "All tabs": one grouped, filterable list (no category switching)
 * v2 — "Categories": bottom category bar + pinned Home (default)
 * v3 — "Workspace": quick jump + pinned + recents + collapsible categories
 * v4 — "Icon rail": v2 categories/pins, with the bar + profile in a left rail
 * v5 — "Stage": v4 rail, dark chrome; selected tab is light and matches the page
 */
export const SIDEBAR_MODE_FLAT = "v1"
export const SIDEBAR_MODE_CATEGORIES = "v2"
export const SIDEBAR_MODE_WORKSPACE = "v3"
export const SIDEBAR_MODE_RAIL = "v4"
export const SIDEBAR_MODE_STAGE = "v5"

export const SIDEBAR_MODE_STORAGE_KEY = "admin_sidebar_mode"
export const SIDEBAR_DEFAULT_MODE = SIDEBAR_MODE_RAIL

/**
 * Temporary rollout floor. Until this local-time cutoff, preferences older
 * than the stable version are upgraded while that version and newer remain
 * untouched. Change these two values for future sidebar rollouts.
 */
export const SIDEBAR_STABLE_VERSION = 4
export const SIDEBAR_STABLE_UNTIL = new Date(2027, 0, 1)

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
  {
    id: SIDEBAR_MODE_STAGE,
    label: "V5",
    name: "Stage",
    description: "Testing: light rail, dark section panel, light selected tab into the page",
  },
]

export const isValidSidebarMode = (value) => SIDEBAR_MODE_OPTIONS.some((option) => option.id === value)

export const sidebarModeVersion = (mode) => {
  const match = /^v(\d+)$/.exec(mode || "")
  return match ? Number(match[1]) : null
}

export const isSidebarStableVersionActive = (now = new Date()) => now < SIDEBAR_STABLE_UNTIL

export const isSidebarModeAtLeastStable = (mode) => {
  const version = sidebarModeVersion(mode)
  return isValidSidebarMode(mode) && version !== null && version >= SIDEBAR_STABLE_VERSION
}

export const enforceSidebarStableVersion = (mode, now = new Date()) => {
  if (!isSidebarStableVersionActive(now) || isSidebarModeAtLeastStable(mode)) return mode
  const stableMode = `v${SIDEBAR_STABLE_VERSION}`
  return isValidSidebarMode(stableMode) ? stableMode : SIDEBAR_DEFAULT_MODE
}

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
 * During the rollout window, raise older preferences to the stable version.
 * The stable version and every newer preference pass through unchanged.
 */
export const resolveSidebarMode = ({ dbMode, storedMode, now } = {}) => enforceSidebarStableVersion(
  isValidSidebarMode(dbMode)
    ? dbMode
    : isValidSidebarMode(storedMode)
      ? storedMode
      : SIDEBAR_DEFAULT_MODE,
  now
)

export const readStoredSidebarMode = () => resolveSidebarMode({ storedMode: readLocalSidebarMode() })
