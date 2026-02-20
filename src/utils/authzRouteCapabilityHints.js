const unique = (items = []) => [...new Set((items || []).filter(Boolean))]

// Capability rollout is paused. Keep one pilot capability as example.
const ROUTE_CAPABILITY_HINTS = {
  "route.admin.students": ["cap.students.edit.personal"],
  "route.warden.students": ["cap.students.edit.personal"],
  "route.associateWarden.students": ["cap.students.edit.personal"],
  "route.hostelSupervisor.students": ["cap.students.edit.personal"],
}

export const getRouteCapabilityHintKeys = (routeKey) => {
  return unique(ROUTE_CAPABILITY_HINTS[routeKey] || [])
}

export const getFilteredHintKeysFromCatalog = (routeKey, _routeLabel, catalogCapabilities = []) => {
  const available = new Set((catalogCapabilities || []).map((item) => item.key))
  return getRouteCapabilityHintKeys(routeKey).filter((key) => available.has(key))
}

export default {
  getRouteCapabilityHintKeys,
  getFilteredHintKeysFromCatalog,
}
