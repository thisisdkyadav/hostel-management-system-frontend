const formatCount = (count) => (count > 99 ? "99+" : String(count))

const DROP_SIZE = "calc(var(--spacing-4) - var(--spacing-0-5) / 2)"

/**
 * Flat count pip. Lift is a single colored drop-shadow so it reads as
 * hovering, not as a beveled button.
 */
const CategoryCountBadge = ({ count }) => {
  if (!count) return null

  const label = formatCount(count)
  const isWide = label.length > 2

  return (
    <span
      aria-hidden
      className="absolute top-0 right-0 z-10 pointer-events-none grid place-items-center rounded-full font-bold tabular-nums"
      style={{
        width: isWide ? "auto" : DROP_SIZE,
        minWidth: DROP_SIZE,
        height: DROP_SIZE,
        paddingInline: isWide ? "var(--spacing-0-5)" : 0,
        transform: "translate(42%, -42%)",
        backgroundColor: "var(--color-danger)",
        color: "var(--color-on-accent)",
        fontSize: "calc(var(--font-size-xs) * 0.78)",
        lineHeight: 1,
        letterSpacing: label.length === 2 ? "-0.04em" : "0",
        filter: "drop-shadow(0 var(--spacing-1) var(--spacing-2) color-mix(in srgb, var(--color-danger) 40%, transparent))",
      }}
    >
      <span style={{ transform: "translateY(0.08em)", lineHeight: 1 }}>{label}</span>
    </span>
  )
}

export default CategoryCountBadge
