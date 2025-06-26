import { useState, useEffect } from "react"
import { HiSave, HiLockClosed, HiPencil } from "react-icons/hi"

const getFieldDescription = (field) => {
  const descriptions = {
    profileImage: "Allow students to update their profile photo.",
    name: "Allow students to modify their displayed name.",
    dateOfBirth: "Allow students to update their date of birth.",
    address: "Allow students to change their address information.",
    gender: "Allow students to update their gender information.",
    familyMembers: "Allow students to add, edit, and manage their family members.",
    phone: "Allow students to update their phone number.",
    emergencyContact: "Allow students to update their emergency contact information.",
    bloodGroup: "Allow students to update their blood group information.",
    admissionDate: "Allow students to update their admission date information.",
  }

  return descriptions[field] || `Allow students to edit their ${field}.`
}

const getFieldIcon = (field) => {
  const icons = {
    profileImage: "📷",
    name: "👤",
    dateOfBirth: "🗓️",
    address: "🏠",
    gender: "⚧️",
    familyMembers: "👪",
    phone: "📞",
    emergencyContact: "🚨",
    bloodGroup: "🩸",
    admissionDate: "📅",
  }

  return icons[field] || "✏️"
}

const StudentEditPermissionsForm = ({ permissions, onUpdate, isLoading }) => {
  const [localPermissions, setLocalPermissions] = useState(permissions)

  // Update local permissions when props change
  useEffect(() => {
    setLocalPermissions(permissions)
  }, [permissions])

  const handleTogglePermission = (field) => {
    const updatedPermissions = localPermissions.map((permission) => (permission.field === field ? { ...permission, allowed: !permission.allowed } : permission))
    setLocalPermissions(updatedPermissions)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onUpdate(localPermissions)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        {localPermissions.map((permission) => (
          <div key={permission.field} className={`flex items-center justify-between p-4 rounded-lg border ${permission.allowed ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}`}>
            <div className="flex items-start space-x-3">
              <div className="text-2xl">{getFieldIcon(permission.field)}</div>
              <div>
                <div className="flex items-center">
                  <p className="font-medium text-gray-800">{permission.label}</p>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${permission.allowed ? "bg-blue-100 text-blue-800" : "bg-gray-200 text-gray-700"}`}>{permission.allowed ? "Editable" : "Locked"}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{getFieldDescription(permission.field)}</p>
                <div className="mt-2 flex items-center text-xs">
                  {permission.allowed ? (
                    <div className="text-blue-600 flex items-center">
                      <HiPencil className="mr-1" />
                      Students can modify this field
                    </div>
                  ) : (
                    <div className="text-gray-500 flex items-center">
                      <HiLockClosed className="mr-1" />
                      Students cannot modify this field
                    </div>
                  )}
                </div>
              </div>
            </div>
            <label className={`relative inline-flex items-center ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
              <input type="checkbox" checked={permission.allowed} onChange={() => handleTogglePermission(permission.field)} className="sr-only peer" disabled={isLoading} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1360AB]"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className={`w-full flex justify-center items-center px-4 py-3 ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#1360AB] hover:bg-[#0d4b86]"} text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Updating...
            </>
          ) : (
            <>
              <HiSave className="mr-2" size={20} />
              Update Permissions
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default StudentEditPermissionsForm
