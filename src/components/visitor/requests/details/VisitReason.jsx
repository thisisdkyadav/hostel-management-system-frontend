import React from "react"

const VisitReason = ({ reason, approvalInformation, isApproved }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="font-medium text-gray-700 mb-3">Reason for Visit</h3>
      <p className="text-sm text-gray-600">{reason}</p>

      {isApproved && approvalInformation && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-green-700 mb-1">Approval Information</h4>
          <p className="text-sm text-gray-700 whitespace-pre-line">{approvalInformation}</p>
        </div>
      )}
    </div>
  )
}

export default VisitReason
