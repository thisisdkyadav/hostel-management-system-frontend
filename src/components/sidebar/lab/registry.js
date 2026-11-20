import { lazy } from "react"

/**
 * Lab sidebars (V9–V18): experimental shells for occasional fun, not daily use.
 * Each lives in its own folder and receives the same props as the V6 Orbit
 * shell (see Sidebar.jsx), plus `modeId`. Loaded on demand.
 */
export const LAB_SIDEBARS = {
  v9: lazy(() => import("./terminal/TerminalSidebar")),
  v10: lazy(() => import("./arcade/ArcadeSidebar")),
  v11: lazy(() => import("./sketchbook/SketchbookSidebar")),
  v12: lazy(() => import("./aquarium/AquariumSidebar")),
  v13: lazy(() => import("./jukebox/JukeboxSidebar")),
  v14: lazy(() => import("./metro/MetroSidebar")),
  v15: lazy(() => import("./daylight/DaylightSidebar")),
  v16: lazy(() => import("./synthwave/SynthwaveSidebar")),
  v17: lazy(() => import("./blueprint/BlueprintSidebar")),
  v18: lazy(() => import("./cabinet/FilingCabinetSidebar")),
}
