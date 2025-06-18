import React from "react"

const SelectedUsersList = ({ users, onRemove, title = "Selected Users", disabled = false }) => {
  const getRoleColor = (role) => {
    const roleColors = {
      Admin: "bg-purple-100 text-purple-800",
      "Super Admin": "bg-purple-100 text-purple-800",
      Warden: "bg-blue-100 text-blue-800",
      "Associate Warden": "bg-blue-100 text-blue-800",
      "Hostel Supervisor": "bg-teal-100 text-teal-800",
      Security: "bg-green-100 text-green-800",
      "Maintenance Staff": "bg-orange-100 text-orange-800",
      Student: "bg-indigo-100 text-indigo-800",
    }

    return roleColors[role] || "bg-gray-100 text-gray-800"
  }

  const getUserInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U"
  }

  if (!users || users.length === 0) {
    return (
      <div className="mt-2">
        <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>
        <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
          <p className="text-sm text-gray-500 text-center">No users selected</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-2">
      <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>
      <ul className="border border-gray-200 rounded-md divide-y divide-gray-200 overflow-hidden">
        {users.map((user) => (
          <li key={user._id} className="bg-white p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${getRoleColor(user.role)}`}>{getUserInitial(user.name)}</div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getRoleColor(user.role)}`}>{user.role}</span>
                  </div>
                </div>
              </div>
              {!disabled && (
                <button type="button" onClick={() => onRemove(user._id)} className="text-gray-400 hover:text-red-500" title="Remove user">
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
