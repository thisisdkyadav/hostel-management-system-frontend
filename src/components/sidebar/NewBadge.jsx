/**
 * Tiny "NEW" tag for highlighting recently-added sidebar controls.
 * Render inside a `relative` parent — it pins to the parent's top-right corner.
 */
const NewBadge = () => (
  <span className="pointer-events-none absolute -top-1.5 -right-1 z-10 px-1 py-px rounded text-[0.5rem] font-bold uppercase leading-none tracking-wide bg-[var(--color-success)] text-white shadow-sm">
    New
  </span>
)

export default NewBadge
