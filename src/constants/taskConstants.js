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
  Created: "bg-gray-100 text-gray-800",
  Assigned: "bg-blue-100 text-blue-800",
  "In Progress": "bg-yellow-100 text-yellow-800",
  Completed: "bg-green-100 text-green-800",
}

export const TASK_PRIORITY_COLORS = {
  Low: "bg-gray-100 text-gray-800",
  Medium: "bg-blue-100 text-blue-800",
  High: "bg-orange-100 text-orange-800",
  Urgent: "bg-red-100 text-red-800",
}

export const ALLOWED_STATUS_UPDATES = {
  User: ["In Progress", "Completed"],
  Admin: TASK_STATUSES,
  "Super Admin": TASK_STATUSES,
}

export const WHO_CAN_CREATE_TASK = ["Admin", "Super Admin"]

export const WHO_CAN_ASSIGN_TASK = ["Admin", "Super Admin"]
