export const TASK_PRIORITIES = ["Low", "Medium", "High", "Urgent"]

export const TASK_STATUSES = ["Created", "Assigned", "In Progress", "Completed"]

export const TASK_CATEGORIES = ["Maintenance", "Security", "Administrative", "Housekeeping", "Other"]

export const TASK_FILTER_TABS = [
  { key: "all", label: "All Tasks" },
  { key: "Created", label: "Created" },
  { key: "Assigned", label: "Assigned" },
  { key: "In Progress", label: "In Progress" },
  { key: "Completed", label: "Completed" },
]

export const TASK_STATUS_COLORS = {
  Created: "bg-[var(--color-bg-muted)] text-[var(--color-text-primary)]",
  Assigned: "bg-[var(--color-primary-bg)] text-[var(--color-primary)]",
  "In Progress": "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]",
  Completed: "bg-[var(--color-success-bg)] text-[var(--color-success-text)]",
}

export const TASK_PRIORITY_COLORS = {
  Low: "bg-[var(--color-bg-muted)] text-[var(--color-text-primary)]",
  Medium: "bg-[var(--color-primary-bg)] text-[var(--color-primary)]",
  High: "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]",
  Urgent: "bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]",
}

export const ALLOWED_STATUS_UPDATES = {
  User: ["In Progress", "Completed"],
  Admin: TASK_STATUSES,
  "Super Admin": TASK_STATUSES,
}

export const WHO_CAN_CREATE_TASK = ["Admin", "Super Admin"]

export const WHO_CAN_ASSIGN_TASK = ["Admin", "Super Admin"]
