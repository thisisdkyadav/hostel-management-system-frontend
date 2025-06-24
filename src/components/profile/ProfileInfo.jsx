import React from "react"
import { FiEdit } from "react-icons/fi"

const ProfileInfo = ({ label, value, icon: Icon, isEditable }) => {
  return (
    <div className="flex items-start py-3 border-b border-gray-100 last:border-0">
      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">{Icon && <Icon className="h-5 w-5 text-[#1360AB]" />}</div>
      <div className="ml-4 flex-grow">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">{label}</p>
          {isEditable && (
            <div className="flex items-center text-xs text-blue-600">
              <FiEdit size={12} className="mr-1" />
              <span>Editable</span>
            </div>
          )}
        </div>
        <p className="font-medium text-gray-800 mt-0.5">{value || "N/A"}</p>
      </div>
    </div>
  )
}

export default ProfileInfo
