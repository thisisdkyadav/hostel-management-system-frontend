import { ADMIN_NAV_CATEGORIES } from "../../constants/navigationConfig"

/** Category accent wash on the sidebar surface; transparent for Home. */
export const getCategoryTint = (categoryId) => {
  const category = ADMIN_NAV_CATEGORIES.find((entry) => entry.id === categoryId)
  if (!category || categoryId === "home") return "transparent"
  return `color-mix(in srgb, var(${category.colorVar}) 14%, var(--color-bg-primary))`
}

/** V5 panel fill. Same token on the rail join and the list so they stay one surface. */
export const getCategoryDarkTint = () => "var(--v5-panel-fill)"
