import React from "react"

const ApprovalForm = ({ selectedHostel, onHostelChange, paymentAmount, onPaymentAmountChange, onCancel, onSubmit, hostelList }) => {
  return (
    <div className="bg-green-50 border border-green-100 p-4 rounded-lg animate-fadeIn">
      <h3 className="font-medium text-green-800 mb-3">Approve Visitor Request</h3>

      {/* Hostel Selection */}
      <div className="mb-3">
        <label htmlFor="hostel-select" className="block text-sm font-medium text-gray-700 mb-1">
          Assign Hostel <span className="text-red-500">*</span>
        </label>
        <select id="hostel-select" value={selectedHostel} onChange={(e) => onHostelChange(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
          <option value="">Select a hostel</option>
          {hostelList.map((hostel) => (
            <option key={hostel._id} value={hostel._id}>
              {hostel.name}
            </option>
          ))}
        </select>
      </div>

      {/* Payment Amount (Optional) */}
      <div className="mb-4">
        <label htmlFor="payment-amount" className="block text-sm font-medium text-gray-700 mb-1">
          Payment Amount (Optional)
        </label>
        <input type="number" id="payment-amount" value={paymentAmount} onChange={(e) => onPaymentAmountChange(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter amount (e.g., 1000)" min="0" />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        <button onClick={onCancel} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
          Cancel
        </button>
        <button onClick={onSubmit} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          Confirm Approval
        </button>
      </div>
    </div>
  )
}

export default ApprovalForm
