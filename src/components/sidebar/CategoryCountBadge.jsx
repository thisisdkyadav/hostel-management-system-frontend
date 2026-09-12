const formatCount = (count) => (count > 99 ? "99+" : String(count))

const CategoryCountBadge = ({ count, ringClass = "ring-2 ring-[var(--color-bg-primary)]" }) => {
  if (!count) return null

  return (
    <span
      aria-hidden
      className={`absolute top-1 right-0.5 min-w-4 h-4 px-1 rounded-full bg-[var(--color-danger)] text-white text-[0.55rem] font-bold leading-none flex items-center justify-center tabular-nums pointer-events-none ${ringClass}`}
    >
      {formatCount(count)}
    </span>
  )
}

export default CategoryCountBadge
