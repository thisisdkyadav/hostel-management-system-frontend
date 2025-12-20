import React from "react"

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
                <button type="button" onClick={() => onRemove(user._id)} className="text-[var(--color-text-disabled)] hover:text-[var(--color-danger)]" title="Remove user">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SelectedUsersList
