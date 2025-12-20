import React from "react"

const RoleFilter = ({ selectedRole = "all", onChange, roles = ["All Roles", "Admin", "Super Admin", "Warden", "Associate Warden", "Hostel Supervisor", "Security", "Maintenance Staff", "Student"], label = "Filter by Role", disabled = false }) => {
  // Map display names to values for the select options
  const roleOptions = roles.map((role) => {
    if (role === "All Roles") return { value: "all", label: role }
    return { value: role, label: role }
  })

  return (
    <div>
      <label htmlFor="role-filter" className="block text-sm font-medium text-[var(--color-text-body)] mb-1">
        {label}
      </label>
      <select id="role-filter" value={selectedRole} onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`block w-full rounded-md shadow-sm text-sm border-[var(--color-border-input)] ${disabled ? "bg-[var(--color-bg-muted)] cursor-not-allowed" : "bg-[var(--color-bg-primary)] focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"}`}
      >
        {roleOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default RoleFilter
