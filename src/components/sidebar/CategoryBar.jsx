import { ADMIN_NAV_CATEGORIES } from "../../constants/navigationConfig"
import { getCategoryTint } from "./categoryStyles"

/**
 * V2 bottom category bar. Accents come from --color-cat-* tokens; active
 * buttons use the page background as text color so contrast holds in dark mode.
 */
const CategoryBar = ({ activeCategory, onCategoryChange }) => {
  return (
    <div
      className="border-t border-[var(--color-border-primary)] transition-all duration-300 px-4 py-3"
      style={{ backgroundColor: getCategoryTint(activeCategory) }}
    >
      <div className="grid grid-cols-5 gap-2">
        {ADMIN_NAV_CATEGORIES.map((category) => {
          const isActiveCategory = activeCategory === category.id
          const accent = `var(${category.colorVar})`
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onCategoryChange(category.id)}
              title={category.name}
              aria-label={category.name}
              aria-pressed={isActiveCategory}
              className={`
                h-10 rounded-xl flex items-center justify-center border transition-all duration-200
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
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default CategoryBar
