import React from "react"

const RoleFilter = ({ selectedRole = "all", onChange, roles = ["All Roles", "Admin", "Super Admin", "Warden", "Associate Warden", "Hostel Supervisor", "Security", "Maintenance Staff", "Student"], label = "Filter by Role", disabled = false }) => {
  // Map display names to values for the select options
  const roleOptions = roles.map((role) => {
    if (role === "All Roles") return { value: "all", label: role }
    return { value: role, label: role }
  })

  return (
    <div>
      <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select id="role-filter" value={selectedRole} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={`block w-full rounded-md shadow-sm text-sm ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white focus:ring-indigo-500 focus:border-indigo-500"} border-gray-300`}>
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
