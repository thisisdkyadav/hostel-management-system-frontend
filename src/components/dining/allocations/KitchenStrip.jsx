import { catererColor } from "../caterer/diningScope"
import CapacityBar from "../CapacityBar"
import "./Allocations.css"

const KitchenBar = ({ name, color, allocated, capacity }) => (
  <>
    <span className="al-kitchen__name">
      {color && <span className="al-kitchen__dot" style={{ "--kitchen": color }} aria-hidden="true" />}
      {name}
    </span>
    <CapacityBar allocated={allocated} total={capacity} size="sm" label="Seats" />
  </>
)

/**
 * One seat bar per kitchen in the period. Oversight can pick a kitchen to narrow the whole page
 * (or "All kitchens" to widen it again); a caterer login just sees its own bar.
 */
const KitchenStrip = ({ caterers, palette, selectedId, oversight, onPick }) => {
  if (!caterers?.length) return null

  if (!oversight) {
    return (
      <section className="al-kitchens" aria-label="Seats by kitchen">
        {caterers.map((caterer) => (
          <div key={caterer.id} className="al-kitchen" data-static>
            <KitchenBar name={caterer.name} color={catererColor(palette, caterer.id)} allocated={caterer.allocated} capacity={caterer.capacity} />
          </div>
        ))}
      </section>
    )
  }

  const total = caterers.reduce(
    (acc, caterer) => ({ allocated: acc.allocated + caterer.allocated, capacity: acc.capacity + caterer.capacity }),
    { allocated: 0, capacity: 0 }
  )

  return (
    <section className="al-kitchens" aria-label="Seats by kitchen">
      <button type="button" className="al-kitchen" aria-pressed={!selectedId} onClick={() => onPick("")}>
        <KitchenBar name="All kitchens" allocated={total.allocated} capacity={total.capacity} />
      </button>
      {caterers.map((caterer) => (
        <button
          key={caterer.id}
          type="button"
          className="al-kitchen"
          aria-pressed={selectedId === caterer.id}
          onClick={() => onPick(selectedId === caterer.id ? "" : caterer.id)}
        >
          <KitchenBar name={caterer.name} color={catererColor(palette, caterer.id)} allocated={caterer.allocated} capacity={caterer.capacity} />
        </button>
      ))}
    </section>
  )
}

export default KitchenStrip
