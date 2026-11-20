/**
 * Admin sidebar display modes.
 *
 * v1 — "All tabs": one grouped, filterable list (no category switching)
 * v2 — "Categories": bottom category bar + pinned Home (default)
 * v3 — "Workspace": quick jump + pinned + recents + collapsible categories
 * v4 — "Icon rail": v2 categories/pins, with the bar + profile in a left rail
 * v5 — "Dock": navy icon rail, white panel; the selected tab flows into the page
 * v6 — "Orbit": deep-space shell; planet categories, a lens thread of tabs, Warp jump
 * v7 — "Console": v6's layout with a calm, professional look
 * v8 — "Tone": v4's layout on a mid-tone frame in the category colour; the page floats on it
 * v9–v18 — "Lab": experimental, just-for-fun shells (sidebar/lab/*); desktop only
 */
export const SIDEBAR_MODE_FLAT = "v1"
export const SIDEBAR_MODE_CATEGORIES = "v2"
export const SIDEBAR_MODE_WORKSPACE = "v3"
export const SIDEBAR_MODE_RAIL = "v4"
export const SIDEBAR_MODE_STAGE = "v5"
export const SIDEBAR_MODE_ORBIT = "v6"
export const SIDEBAR_MODE_CONSOLE = "v7"
export const SIDEBAR_MODE_TONE = "v8"

/** Lab: experimental shells, one folder each under sidebar/lab (see lab/registry.js). */
export const SIDEBAR_LAB_MODE_IDS = ["v9", "v10", "v11", "v12", "v13", "v14", "v15", "v16", "v17", "v18"]

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
    hidden: true,
  },
  {
    id: SIDEBAR_MODE_CATEGORIES,
    label: "V2",
    name: "Categories",
    description: "Category bar at the bottom, pinned tabs on Home",
    hidden: true,
  },
  {
    id: SIDEBAR_MODE_WORKSPACE,
    label: "V3",
    name: "Workspace",
    description: "Pinned, recents and Ctrl+K quick jump",
    hidden: true,
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
    name: "Dock",
    description: "Dock: navy icon rail, white panel; the selected tab flows into the page",
  },
  {
    id: SIDEBAR_MODE_ORBIT,
    label: "V6",
    name: "Orbit",
    description: "Deep-space console: planet categories, a lens list, Ctrl+K to warp anywhere",
  },
  {
    id: SIDEBAR_MODE_CONSOLE,
    label: "V7",
    name: "Console",
    description: "V6's layout with a calm, professional look: category column, page list, Ctrl+K to go to any page",
  },
  {
    id: SIDEBAR_MODE_TONE,
    label: "V8",
    name: "Tone",
    description: "V4's layout on a colour frame that follows the category; the page floats on it",
  },
  { id: "v9", label: "X1", name: "Terminal", description: "Green-phosphor CRT shell: tabs as directories, scanlines and a blinking cursor", lab: true },
  { id: "v10", label: "X2", name: "Arcade", description: "8-bit game cabinet: categories are worlds, tabs are levels", lab: true },
  { id: "v11", label: "X3", name: "Sketchbook", description: "Hand-drawn notebook: ruled paper, doodled underlines, sticky-note tabs", lab: true },
  { id: "v12", label: "X4", name: "Aquarium", description: "Underwater: caustic light, rising bubbles, tabs drift like fish", lab: true },
  { id: "v13", label: "X5", name: "Jukebox", description: "Record player: categories are records on a turntable, tabs are tracks", lab: true },
  { id: "v14", label: "X6", name: "Metro", description: "Transit map: categories are lines, tabs are stations, a train rides to your stop", lab: true },
  { id: "v15", label: "X7", name: "Daylight", description: "A live sky that follows the time in India: sun, moon, drifting clouds", lab: true },
  { id: "v16", label: "X8", name: "Synthwave", description: "Neon signs over a retro grid horizon, with a little flicker", lab: true },
  { id: "v17", label: "X9", name: "Blueprint", description: "Technical drawing: drafting grid, dimension lines and annotations", lab: true },
  { id: "v18", label: "X10", name: "Filing Cabinet", description: "Desk skeuomorph: drawers for categories, manila folders for tabs", lab: true },
]

export const isLabSidebarMode = (mode) => SIDEBAR_LAB_MODE_IDS.includes(mode)

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

const SIDEBAR_PREVIEW_KEY = "admin_sidebar_preview"

/**
 * Dev-only preview: open any page with ?sidebarPreview=v12 to show that layout
 * for this tab (sessionStorage) without saving it. ?sidebarPreview=off clears it.
 */
export const readSidebarPreviewMode = () => {
  if (!import.meta.env.DEV || typeof window === "undefined") return null
  try {
    const param = new URLSearchParams(window.location.search).get("sidebarPreview")
    if (param === "off") window.sessionStorage.removeItem(SIDEBAR_PREVIEW_KEY)
    else if (isValidSidebarMode(param)) window.sessionStorage.setItem(SIDEBAR_PREVIEW_KEY, param)
    const stored = window.sessionStorage.getItem(SIDEBAR_PREVIEW_KEY)
    return isValidSidebarMode(stored) ? stored : null
  } catch {
    return null
  }
}
