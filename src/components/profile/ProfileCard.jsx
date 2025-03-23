import React from "react"

const ProfileCard = ({ title, children, actionButton }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
      <div className="px-5 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-medium text-gray-700">{title}</h3>
        {actionButton && actionButton}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export default ProfileCard
