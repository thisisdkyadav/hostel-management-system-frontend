/**
 * Frontend AuthZ helpers (Layer-3)
 */

const normalizeKey = (value) => (typeof value === "string" ? value.trim() : "")
const ACTIVE_CAPABILITY_KEYS = new Set(["cap.students.edit.personal"])
const normalizePath = (value) => {
  if (typeof value !== "string") return ""

  const trimmed = value.trim()
  if (!trimmed) return ""

  const [withoutHash] = trimmed.split("#")
  const [withoutQuery] = withoutHash.split("?")
  if (!withoutQuery) return ""

  if (withoutQuery === "/") return "/"
  return withoutQuery.endsWith("/") ? withoutQuery.slice(0, -1) : withoutQuery
}

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
const convertCatalogPathToRegex = (catalogPath) => {
  const normalized = normalizePath(catalogPath)
  if (!normalized) return null
  if (normalized === "/") return /^\/$/

  const segments = normalized
    .split("/")
    .filter(Boolean)
    .map((segment) => (segment.startsWith(":") ? "[^/]+" : escapeRegex(segment)))

  return new RegExp(`^/${segments.join("/")}$`)
}

export const createOpenEffectiveAuthz = (role = null) => ({
  role,
  routeAccess: {},
  capabilities: { "*": true },
  constraints: {},
})

export const canRoute = (effectiveAuthz, routeKey) => {
  const key = normalizeKey(routeKey)
  if (!key) return false

  // Default-open until layer-3 starts enforcement in routes/components.
  if (!effectiveAuthz) return true

  const explicit = effectiveAuthz.routeAccess?.[key]
  if (typeof explicit === "boolean") return explicit

  return true
}

export const canCapability = (effectiveAuthz, capabilityKey) => {
  const key = normalizeKey(capabilityKey)
  if (!key) return false

  // Capability rollout is paused except selected pilot keys.
  if (!ACTIVE_CAPABILITY_KEYS.has(key)) return true

  if (!effectiveAuthz) return true

  const explicit = effectiveAuthz.capabilities?.[key]
  if (typeof explicit === "boolean") return explicit

  if (typeof effectiveAuthz.capabilities?.["*"] === "boolean") {
    return effectiveAuthz.capabilities["*"]
  }

  return true
}

export const canAnyCapability = (effectiveAuthz, keys = []) => {
  if (!Array.isArray(keys) || keys.length === 0) return false
  const activeKeys = keys.filter((key) => ACTIVE_CAPABILITY_KEYS.has(normalizeKey(key)))
  if (activeKeys.length === 0) return true
  return activeKeys.some((key) => canCapability(effectiveAuthz, key))
}

export const canAllCapabilities = (effectiveAuthz, keys = []) => {
  if (!Array.isArray(keys) || keys.length === 0) return false
  const activeKeys = keys.filter((key) => ACTIVE_CAPABILITY_KEYS.has(normalizeKey(key)))
  if (activeKeys.length === 0) return true
  return activeKeys.every((key) => canCapability(effectiveAuthz, key))
}

export const getConstraint = (effectiveAuthz, key, fallback = null) => {
  const normalizedKey = normalizeKey(key)
  if (!normalizedKey) return fallback

  if (!effectiveAuthz || !effectiveAuthz.constraints) return fallback

  if (!Object.prototype.hasOwnProperty.call(effectiveAuthz.constraints, normalizedKey)) {
    return fallback
  }

  return effectiveAuthz.constraints[normalizedKey]
}

export const buildRoutePathMapFromCatalog = (catalog) => {
  const map = {}
  const routes = Array.isArray(catalog?.routes) ? catalog.routes : []

  for (const routeDef of routes) {
    if (!routeDef || !routeDef.key || !Array.isArray(routeDef.paths)) continue

    for (const path of routeDef.paths) {
      if (typeof path === "string" && path.trim().length > 0) {
        map[normalizePath(path)] = routeDef.key
      }
    }
  }

  return map
}

export const buildRoutePathMatchersFromCatalog = (catalog) => {
  const matchers = []
  const routes = Array.isArray(catalog?.routes) ? catalog.routes : []

  for (const routeDef of routes) {
    if (!routeDef || !routeDef.key || !Array.isArray(routeDef.paths)) continue

    for (const path of routeDef.paths) {
      const normalizedPath = normalizePath(path)
      if (!normalizedPath) continue

      const regex = convertCatalogPathToRegex(normalizedPath)
      if (!regex) continue

      matchers.push({
        key: routeDef.key,
        path: normalizedPath,
        regex,
      })
    }
  }

  return matchers
}

export const resolveRouteKeyByPath = (path, exactMap = {}, matchers = []) => {
  const normalized = normalizePath(path)
  if (!normalized) return null

  if (exactMap[normalized]) {
    return exactMap[normalized]
  }

  const matched = matchers.find((matcher) => matcher.regex.test(normalized))
  return matched?.key || null
}
