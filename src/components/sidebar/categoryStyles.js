import { ADMIN_NAV_CATEGORIES } from "../../constants/navigationConfig"

/** 10% tint of a category accent; transparent for Home. */
export const getCategoryTint = (categoryId) => {
  const category = ADMIN_NAV_CATEGORIES.find((entry) => entry.id === categoryId)
  if (!category || categoryId === "home") return "transparent"
  return `color-mix(in srgb, var(${category.colorVar}) 10%, transparent)`
}
