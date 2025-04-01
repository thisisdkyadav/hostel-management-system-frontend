import React from "react"

const VisitReason = ({ reason }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="font-medium text-gray-700 mb-3">Reason for Visit</h3>
      <p className="text-sm text-gray-600">{reason}</p>
    </div>
  )
}

export default VisitReason
