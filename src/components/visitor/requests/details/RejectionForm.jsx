import React from "react"

const RejectionForm = ({ rejectionReason, onReasonChange, onCancel, onSubmit }) => {
  return (
    <div className="bg-red-50 border border-red-100 p-4 rounded-lg animate-fadeIn">
      <h3 className="font-medium text-red-800 mb-3">Reject Visitor Request</h3>
      <div className="mb-3">
        <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700 mb-1">
          Reason for Rejection (Optional)
        </label>
        <textarea
          id="rejection-reason"
          value={rejectionReason}
          onChange={(e) => onReasonChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows="3"
          placeholder="Please provide an optional reason for rejection"
        ></textarea>
      </div>
      <div className="flex justify-end space-x-2">
        <button onClick={onCancel} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
          Cancel
        </button>
        <button onClick={onSubmit} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          Confirm Rejection
        </button>
      </div>
    </div>
  )
}

export default RejectionForm
