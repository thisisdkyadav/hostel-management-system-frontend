import React from "react"
import { format } from "date-fns"

const SecurityCheck = ({ checkInTime, checkOutTime }) => {
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A"

    const date = new Date(dateTimeString)
    return format(date, "MMM d, yyyy h:mm a")
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Security Check Status</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700">Check-in Time</h4>
          <div className="mt-1 flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${checkInTime ? "bg-green-500" : "bg-gray-300"}`}></div>
            <p className="text-sm text-gray-900">{formatDateTime(checkInTime)}</p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700">Check-out Time</h4>
          <div className="mt-1 flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${checkOutTime ? "bg-green-500" : "bg-gray-300"}`}></div>
            <p className="text-sm text-gray-900">{formatDateTime(checkOutTime)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SecurityCheck
