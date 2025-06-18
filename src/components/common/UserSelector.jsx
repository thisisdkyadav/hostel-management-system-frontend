import { useState } from "react"
import UserSearch from "./UserSearch"
import SelectedUsersList from "./SelectedUsersList"
import RoleFilter from "./RoleFilter"

const UserSelector = ({
  selectedUsers = [],
  onAddUser,
  onRemoveUser,
  title = "Assign Users",
  selectedUsersTitle = "Selected Users",
  searchPlaceholder = "Search users...",
  disabled = false,
  required = false,
  error = "",
  maxResults = 5,
  showRoleFilter = true,
  availableRoles = ["All Roles", "Admin", "Super Admin", "Warden", "Associate Warden", "Hostel Supervisor", "Security", "Maintenance Staff", "Student"],
}) => {
  const [selectedRole, setSelectedRole] = useState("all")

  const handleRoleChange = (role) => {
    setSelectedRole(role)
  }

  return (
    <div>
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {title} {required && <span className="text-red-600">*</span>}
        </label>

        <div className="space-y-3">
          {showRoleFilter && <RoleFilter selectedRole={selectedRole} onChange={handleRoleChange} roles={availableRoles} disabled={disabled} />}

          <UserSearch onSelectUser={onAddUser} selectedUsers={selectedUsers} roleFilter={selectedRole} placeholder={searchPlaceholder} maxResults={maxResults} disabled={disabled} />
        </div>

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      <SelectedUsersList users={selectedUsers} onRemove={onRemoveUser} title={selectedUsersTitle} disabled={disabled} />
    </div>
  )
}

export default UserSelector
