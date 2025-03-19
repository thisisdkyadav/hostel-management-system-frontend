import React from "react"

const ActivityItem = ({ icon, iconBgColor, iconColor, name, status, statusColor, additionalInfo, time }) => {
  return (
    <li className="flex items-center justify-between py-2 border-b">
      <div className="flex items-center">
        <div className={`${iconBgColor} rounded-full w-8 h-8 flex items-center justify-center mr-3`}>
          <span className={iconColor}>{icon}</span>
        </div>
        <div>
          <p className="font-medium">{name}</p>
          <p className={`text-xs ${statusColor}`}>
            {status} {additionalInfo && `• ${additionalInfo}`}
          </p>
        </div>
      </div>
      <span className="text-xs text-gray-500">{time}</span>
    </li>
  )
}

export default ActivityItem
