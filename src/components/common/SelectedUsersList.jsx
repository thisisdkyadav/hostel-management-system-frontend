import React from "react"
import { FaTimes } from "react-icons/fa"
import { Button } from "czero/react"

const SelectedUsersList = ({ users, onRemove, title = "Selected Users", disabled = false }) => {
  const getRoleColor = (role) => {
    const roleColors = {
      Admin: "bg-[var(--color-info-bg)] text-[var(--color-info)]",
      "Super Admin": "bg-[var(--color-info-bg)] text-[var(--color-info)]",
      Warden: "bg-[var(--color-primary-bg)] text-[var(--color-primary)]",
      "Associate Warden": "bg-[var(--color-primary-bg)] text-[var(--color-primary)]",
      "Hostel Supervisor": "bg-[var(--color-success-bg-light)] text-[var(--color-success)]",
      Security: "bg-[var(--color-success-bg-light)] text-[var(--color-success-dark)]",
      "Maintenance Staff": "bg-[var(--color-warning-bg)] text-[var(--color-warning-dark)]",
      Student: "bg-[var(--color-primary-bg)] text-[var(--color-primary-dark)]",
    }

    return roleColors[role] || "bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]"
  }

  const getUserInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U"
  }

  if (!users || users.length === 0) {
    return (
      <div className="mt-2">
        <h3 className="text-sm font-medium text-[var(--color-text-body)] mb-2">{title}</h3>
        <div className="border border-[var(--color-border-primary)] rounded-md p-4 bg-[var(--color-bg-tertiary)]">
          <p className="text-sm text-[var(--color-text-muted)] text-center">No users selected</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-2">
      <h3 className="text-sm font-medium text-[var(--color-text-body)] mb-2">{title}</h3>
      <ul className="border border-[var(--color-border-primary)] rounded-md divide-y divide-[var(--color-border-primary)] overflow-hidden">
        {users.map((user) => (
          <li key={user._id} className="bg-[var(--color-bg-primary)] p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${getRoleColor(user.role)}`}>{getUserInitial(user.name)}</div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{user.name}</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs text-[var(--color-text-muted)]">{user.email}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getRoleColor(user.role)}`}>{user.role}</span>
                  </div>
                </div>
              </div>
              {!disabled && (
                <Button type="button" onClick={() => onRemove(user._id)} variant="ghost" size="sm" aria-label="Remove user"><FaTimes className="h-5 w-5" /></Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SelectedUsersList
