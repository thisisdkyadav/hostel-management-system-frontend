import React from "react"
import Select from "./ui/Select"

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
      <Select id="role-filter" value={selectedRole} onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        options={roleOptions}
      />
    </div>
  )
}

export default RoleFilter
