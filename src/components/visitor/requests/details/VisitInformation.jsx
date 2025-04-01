import React from "react"
import { FaCalendarAlt } from "react-icons/fa"

const VisitInformation = ({ fromDate, toDate }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const calculateDuration = (from, to) => {
    return Math.ceil((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="font-medium text-gray-700 mb-3 flex items-center">
        <FaCalendarAlt className="mr-2 text-[#1360AB]" /> Visit Information
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600 text-sm">From Date:</span>
          <span className="font-medium text-sm">{formatDate(fromDate)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 text-sm">To Date:</span>
          <span className="font-medium text-sm">{formatDate(toDate)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 text-sm">Duration:</span>
          <span className="font-medium text-sm">{calculateDuration(fromDate, toDate)} days</span>
        </div>
      </div>
    </div>
  )
}

export default VisitInformation
