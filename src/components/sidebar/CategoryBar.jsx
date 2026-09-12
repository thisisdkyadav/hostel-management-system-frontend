import { ADMIN_NAV_CATEGORIES } from "../../constants/navigationConfig"
import { getCategoryTint } from "./categoryStyles"
import { Grid, Surface } from "hzero"
import CategoryCountBadge from "./CategoryCountBadge"

/**
 * V2 bottom category bar. Accents come from --color-cat-* tokens; active
 * buttons use the page background as text color so contrast holds in dark mode.
 */
const CategoryBar = ({ activeCategory, onCategoryChange, newCategoryIds, categoryCounts }) => {
  return (
    <Surface bg={getCategoryTint(activeCategory)} className="border-t border-[var(--color-border-primary)] transition-all duration-300 px-4 py-3">
      <Grid cols={5} gap={2}>
        {ADMIN_NAV_CATEGORIES.map((category) => {
          const isActiveCategory = activeCategory === category.id
          const accent = `var(${category.colorVar})`
          const hasNew = Boolean(newCategoryIds?.has(category.id))
          const count = categoryCounts?.[category.id] || 0
          const accessibleLabel = [
            category.name,
            count > 0 ? `${count > 99 ? "99+" : count} needing attention` : null,
            hasNew && !count ? "new" : null,
          ].filter(Boolean).join(", ")
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onCategoryChange(category.id)}
              title={accessibleLabel}
              aria-label={accessibleLabel}
              aria-pressed={isActiveCategory}
              className={`
                relative h-10 rounded-xl flex items-center justify-center border transition-all duration-200
                outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40
                ${isActiveCategory ? "shadow-md" : "bg-[var(--color-bg-primary)] hover:scale-105 active:scale-95"}
              `}
              style={
                isActiveCategory
                  ? { backgroundColor: accent, borderColor: accent, color: "var(--color-bg-primary)" }
                  : { borderColor: "var(--color-border-primary)", color: accent }
              }
            >
              <category.icon size={17} strokeWidth={isActiveCategory ? 2.2 : 1.8} />
              <CategoryCountBadge
                count={count}
                ringClass={isActiveCategory ? "ring-2 ring-[var(--color-on-accent)]" : "ring-2 ring-[var(--color-bg-primary)]"}
              />
              {hasNew && !count && (
                <span
                  aria-hidden
                  className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--color-success)] pointer-events-none ring-2 ${isActiveCategory ? "ring-[var(--color-on-accent)]" : "ring-[var(--color-bg-primary)]"}`}
                />
              )}
            </button>
          )
        })}
      </Grid>
    </Surface>
  )
}

export default CategoryBar
