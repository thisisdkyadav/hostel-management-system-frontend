const unique = (items = []) => [...new Set((items || []).filter(Boolean))]

const ROUTE_CAPABILITY_HINTS = {
  "route.superAdmin.dashboard": ["cap.users.view", "cap.settings.system.view"],
  "route.warden.dashboard": ["cap.students.list.view", "cap.students.view"],
  "route.associateWarden.dashboard": ["cap.students.list.view", "cap.students.view"],
  "route.hostelSupervisor.dashboard": ["cap.students.list.view", "cap.students.view"],
  "route.hostelGate.dashboard": ["cap.students.view", "cap.students.detail.view"],
  "route.maintenance.dashboard": ["cap.tasks.view"],
  "route.gymkhana.dashboard": ["cap.events.view"],

  "route.admin.profile": ["cap.profile.self.view", "cap.profile.self.update"],
  "route.superAdmin.profile": ["cap.profile.self.view", "cap.profile.self.update"],
  "route.warden.profile": ["cap.profile.self.view", "cap.profile.self.update"],
  "route.associateWarden.profile": ["cap.profile.self.view", "cap.profile.self.update"],
  "route.hostelSupervisor.profile": ["cap.profile.self.view", "cap.profile.self.update"],
  "route.gymkhana.profile": ["cap.profile.self.view", "cap.profile.self.update"],
  "route.student.profile": ["cap.profile.self.view", "cap.profile.self.update"],
  "route.hostelGate.attendance": ["cap.attendance.record", "cap.attendance.view"],
  "route.maintenance.attendance": ["cap.attendance.view"],
}

const CAPABILITY_FAMILY_HINTS = [
  { match: /authz/i, capabilities: ["cap.authz.view", "cap.authz.update"] },
  { match: /(administrator|warden|supervisor|security|maintenance|admins)/i, capabilities: ["cap.users.view", "cap.users.create", "cap.users.edit", "cap.users.delete"] },
  { match: /student/i, capabilities: ["cap.students.view", "cap.students.list.view", "cap.students.detail.view"] },
  { match: /inventory/i, capabilities: ["cap.inventory.view", "cap.inventory.assign", "cap.inventory.edit"] },
  { match: /complaint/i, capabilities: ["cap.complaints.view", "cap.complaints.create", "cap.complaints.review", "cap.complaints.resolve"] },
  { match: /disciplinary|disco/i, capabilities: ["cap.students.disciplinary.view", "cap.students.disciplinary.manage"] },
  { match: /event|gymkhana|mega/i, capabilities: ["cap.events.view", "cap.events.create", "cap.events.approve"] },
  { match: /visitor|appointment/i, capabilities: ["cap.visitors.view", "cap.visitors.create", "cap.visitors.approve", "cap.visitors.allocate"] },
  { match: /leave/i, capabilities: ["cap.leaves.view", "cap.leaves.create", "cap.leaves.review"] },
  { match: /security|entries|scanner/i, capabilities: ["cap.students.view", "cap.students.detail.view", "cap.attendance.record", "cap.attendance.view"] },
  { match: /lostandfound|lost-and-found/i, capabilities: ["cap.lostAndFound.view", "cap.lostAndFound.create", "cap.lostAndFound.edit", "cap.lostAndFound.delete"] },
  { match: /notification/i, capabilities: ["cap.notifications.view", "cap.notifications.send"] },
  { match: /feedback/i, capabilities: ["cap.feedback.view", "cap.feedback.create", "cap.feedback.react"] },
  { match: /task/i, capabilities: ["cap.tasks.view", "cap.tasks.manage", "cap.tasks.status.update"] },
  { match: /sheet/i, capabilities: ["cap.sheet.view"] },
  { match: /settings|api|key/i, capabilities: ["cap.settings.view", "cap.settings.update", "cap.settings.system.view", "cap.settings.system.update"] },
  { match: /hostel/i, capabilities: ["cap.hostels.view", "cap.hostels.manage"] },
  { match: /undertaking/i, capabilities: ["cap.undertakings.view", "cap.undertakings.manage", "cap.undertakings.accept"] },
  { match: /idcard|id-card/i, capabilities: ["cap.students.idCard.view", "cap.students.idCard.upload"] },
]

export const getRouteCapabilityHintKeys = (routeKey, routeLabel = "") => {
  const direct = ROUTE_CAPABILITY_HINTS[routeKey] || []
  const text = `${routeKey} ${routeLabel}`.toLowerCase()

  const inferred = []
  for (const family of CAPABILITY_FAMILY_HINTS) {
    if (family.match.test(text)) {
      inferred.push(...family.capabilities)
    }
  }

  return unique([...direct, ...inferred])
}

export const getFilteredHintKeysFromCatalog = (routeKey, routeLabel, catalogCapabilities = []) => {
  const available = new Set((catalogCapabilities || []).map((item) => item.key))
  return getRouteCapabilityHintKeys(routeKey, routeLabel).filter((key) => available.has(key))
}

export default {
  getRouteCapabilityHintKeys,
  getFilteredHintKeysFromCatalog,
}
