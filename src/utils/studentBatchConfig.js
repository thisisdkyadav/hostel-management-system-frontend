const normalizeName = (value) => (typeof value === "string" ? value.trim() : "")
export const MIXED_BATCH_SCOPE_KEY = "__MIXED__"

const sortNames = (left, right) => (
  left.localeCompare(right, undefined, { sensitivity: "base", numeric: true })
)

const normalizeScopeKey = (value) => {
  const normalized = normalizeName(value)
  if (!normalized) return ""
  return normalized === MIXED_BATCH_SCOPE_KEY ? MIXED_BATCH_SCOPE_KEY : normalized
}

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
  const normalizedDegree = normalizeScopeKey(degree)
  const normalizedDepartment = normalizeScopeKey(department)

  if (!normalizedDegree || !normalizedDepartment) return []

  return dedupeNames(config?.[normalizedDegree]?.[normalizedDepartment] || [])
}

export const setBatchesForSelection = (config = {}, degree = "", department = "", batches = []) => {
  const normalizedDegree = normalizeScopeKey(degree)
  const normalizedDepartment = normalizeScopeKey(department)

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

export const getBatchScopeLabel = (value = "", type = "degree") => {
  const normalizedValue = normalizeScopeKey(value)
  if (normalizedValue === MIXED_BATCH_SCOPE_KEY) {
    return type === "department" ? "Mixed Department" : "Mixed Degree"
  }
  return normalizedValue
}

export const createBatchScopeOptions = (items = [], type = "degree") => {
  const mixedLabel = type === "department" ? "Mixed Department" : "Mixed Degree"
  const normalizedItems = dedupeNames(items).map((item) => ({ value: item, label: item }))
  return normalizedItems.length > 0
    ? [...normalizedItems, { value: MIXED_BATCH_SCOPE_KEY, label: mixedLabel }]
    : [{ value: MIXED_BATCH_SCOPE_KEY, label: mixedLabel }]
}

export default {
  MIXED_BATCH_SCOPE_KEY,
  getBatchesForSelection,
  setBatchesForSelection,
  countConfiguredBatches,
  getBatchScopeLabel,
  createBatchScopeOptions,
}
