import React from "react"

const SectionHeader = ({ icon, title, rightContent }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        {icon && <span className="text-[#1360AB] text-xl">{icon}</span>}
        <h3 className="text-gray-700 font-semibold">{title}</h3>
      </div>
      {rightContent && <div>{rightContent}</div>}
    </div>
  )
}

export default SectionHeader
