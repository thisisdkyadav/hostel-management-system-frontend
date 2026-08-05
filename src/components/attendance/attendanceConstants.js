// Shared frontend constants for the attendance feature.

export const MAX_ROSTER = 5000

export const OCCURRENCE_STATUS = {
  OPEN: "open",
  CLOSED: "closed",
}

// Roles allowed to manage occurrences (create/edit/delete/roster).
export const MANAGER_ROLES = ["Admin", "Super Admin"]

export const isManagerRole = (role) => MANAGER_ROLES.includes(role)
