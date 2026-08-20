/**
 * Split identifiers like 12, 105, "A201" into 100-wide bands.
 * These are display groups, not real floor numbers.
 */
export const numberBand = (value) => {
  const digits = String(value ?? "").match(/\d+/)
  const n = digits ? parseInt(digits[0], 10) : 0
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.floor(n / 100)
}

export const bandLabel = (band) => {
  const start = band * 100
  return `${start}–${start + 99}`
}

export const groupByBand = (items, getNumber) => {
  const groups = new Map()
  for (const item of items) {
    const band = numberBand(getNumber(item))
    if (!groups.has(band)) groups.set(band, [])
    groups.get(band).push(item)
  }

  return [...groups.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([band, grouped]) => ({
      band,
      label: bandLabel(band),
      items: [...grouped].sort((a, b) =>
        String(getNumber(a) ?? "").localeCompare(String(getNumber(b) ?? ""), undefined, {
          numeric: true,
          sensitivity: "base",
        })
      ),
    }))
}
