const normalizeName = (value) => (typeof value === "string" ? value.trim() : "")

const sortNames = (left, right) => (
  left.localeCompare(right, undefined, { sensitivity: "base", numeric: true })
)

const dedupeNames = (values = []) => {
  const seen = new Set()
  const unique = []

  values.forEach((value) => {
    const normalized = normalizeName(value)
    if (!normalized) return

    const key = normalized.toLowerCase()
    if (seen.has(key)) return

    seen.add(key)
    unique.push(normalized)
  })

  return unique.sort(sortNames)
}

export const getBatchesForSelection = (config = {}, degree = "", department = "") => {
  const normalizedDegree = normalizeName(degree)
  const normalizedDepartment = normalizeName(department)

  if (!normalizedDegree || !normalizedDepartment) return []

  return dedupeNames(config?.[normalizedDegree]?.[normalizedDepartment] || [])
}

export const setBatchesForSelection = (config = {}, degree = "", department = "", batches = []) => {
  const normalizedDegree = normalizeName(degree)
  const normalizedDepartment = normalizeName(department)

  if (!normalizedDegree || !normalizedDepartment) return config

  const nextConfig = structuredClone(config || {})
  const nextDegreeConfig = { ...(nextConfig[normalizedDegree] || {}) }
  nextDegreeConfig[normalizedDepartment] = dedupeNames(batches)
  nextConfig[normalizedDegree] = Object.fromEntries(
    Object.entries(nextDegreeConfig).sort(([left], [right]) => sortNames(left, right))
  )

  return Object.fromEntries(
    Object.entries(nextConfig).sort(([left], [right]) => sortNames(left, right))
  )
}

export const countConfiguredBatches = (config = {}) => {
  return Object.values(config || {}).reduce((total, departments) => (
    total + Object.values(departments || {}).reduce((departmentTotal, batches) => (
      departmentTotal + (Array.isArray(batches) ? batches.length : 0)
    ), 0)
  ), 0)
}

export default {
  getBatchesForSelection,
  setBatchesForSelection,
  countConfiguredBatches,
}
