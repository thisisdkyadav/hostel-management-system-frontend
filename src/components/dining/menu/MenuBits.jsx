import { Star } from "lucide-react"
import { DIET_LABELS } from "./menuHelpers"

/** The veg / egg / non-veg mark. Colour follows the status tokens; shape differs so it survives greyscale prints. */
export const DietDot = ({ diet = "" }) => (
  <span className="dm-diet" data-diet={diet || "none"} role="img" aria-label={DIET_LABELS[diet || ""]} title={DIET_LABELS[diet || ""]} />
)

/** Read-only dish list: diet dot, name, star for specials. */
export const ItemList = ({ items = [], dense = false }) => (
  <ul className="dm-items" data-dense={dense || undefined}>
    {items.map((item) => (
      <li key={item.name} className="dm-item" data-special={item.special || undefined}>
        <DietDot diet={item.diet} />
        <span className="dm-item__name">{item.name}</span>
        {item.special && <Star size={11} className="dm-item__star" aria-label="Special" fill="currentColor" />}
      </li>
    ))}
  </ul>
)

export const DietLegend = () => (
  <div className="dm-legend" aria-label="Diet key">
    {["veg", "egg", "nonveg"].map((diet) => (
      <span key={diet} className="dm-legend__item">
        <DietDot diet={diet} />
        {diet === "veg" ? "Veg" : diet === "egg" ? "Egg" : "Non-veg"}
      </span>
    ))}
    <span className="dm-legend__item">
      <Star size={11} className="dm-item__star" fill="currentColor" aria-hidden="true" /> Special
    </span>
  </div>
)
