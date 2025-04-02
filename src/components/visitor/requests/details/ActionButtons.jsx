import React from "react"

const ActionButtons = ({
  userRole,
  requestStatus,
  onClose,
  onCancelRequest,
  onShowApproveForm,
  onShowRejectForm,
  onShowAllocationForm,
  onEditRequest,
  showApproveForm,
  showRejectForm,
  hasAllocatedRooms,
  // Security specific props
  onShowCheckInForm,
  onShowCheckOutForm,
  showCheckInForm,
  isCheckInForm,
  isCheckOutForm,
  isCheckTimes,
}) => {
  const isPending = requestStatus === "Pending"
  const isApproved = requestStatus === "Approved"
  const isRejected = requestStatus === "Rejected"

  return (
    <div className="flex flex-wrap justify-end space-x-3 pt-4 border-t border-gray-200">
      {/* Student actions */}
      {userRole === "Student" && isPending && (
        <>
          <button onClick={onCancelRequest} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-sm transition-colors">
            Cancel Request
          </button>
          <button onClick={onEditRequest} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg shadow-sm transition-colors">
            Edit Request
          </button>
        </>
      )}

      {/* Admin actions for pending requests */}
      {userRole === "Admin" && isPending && (
        <>
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg shadow-sm transition-colors">
            Close
          </button>
          <button onClick={onShowRejectForm} className={`px-4 py-2 ${showRejectForm ? "bg-red-600" : "bg-red-500 hover:bg-red-600"} text-white rounded-lg shadow-sm transition-colors`}>
            {showRejectForm ? "Cancel" : "Reject"}
          </button>
          <button onClick={onShowApproveForm} className={`px-4 py-2 ${showApproveForm ? "bg-blue-600" : "bg-[#1360AB] hover:bg-blue-600"} text-white rounded-lg shadow-sm transition-colors`}>
            {showApproveForm ? "Cancel" : "Approve"}
          </button>
        </>
      )}

      {/* Warden actions for approved requests */}
      {["Warden", "Associate Warden"].includes(userRole) && isApproved && (
        <>
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg shadow-sm transition-colors">
            Close
          </button>
          {!hasAllocatedRooms && (
            <button onClick={onShowAllocationForm} className="px-4 py-2 bg-[#1360AB] hover:bg-blue-600 text-white rounded-lg shadow-sm transition-colors">
              Allocate Rooms
            </button>
          )}
        </>
      )}

      {/* Security/Guard actions for approved requests */}
      {userRole === "Security" && isApproved && (
        <>
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg shadow-sm transition-colors">
            Close
          </button>

          {hasAllocatedRooms && (
            <>
              {isCheckTimes && (
                <button onClick={onShowCheckInForm} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg shadow-sm transition-colors">
                  Edit Check Times
                </button>
              )}

              {isCheckInForm && (
                <button onClick={onShowCheckInForm} className={`px-4 py-2 ${showCheckInForm ? "bg-blue-600" : "bg-[#1360AB] hover:bg-blue-600"} text-white rounded-lg shadow-sm transition-colors`}>
                  {showCheckInForm ? "Cancel" : "Check In"}
                </button>
              )}

              {isCheckOutForm && (
                <button onClick={onShowCheckInForm} className={`px-4 py-2 ${showCheckInForm ? "bg-green-600" : "bg-green-500 hover:bg-green-600"} text-white rounded-lg shadow-sm transition-colors`}>
                  {showCheckInForm ? "Cancel" : "Check Out"}
                </button>
              )}
            </>
          )}
        </>
      )}

      {/* Default close button for other cases */}
      {((userRole !== "Admin" && userRole !== "Warden" && userRole !== "Associate Warden" && userRole !== "Security") || (userRole === "Admin" && !isPending) || (["Warden", "Associate Warden"].includes(userRole) && !isApproved) || (userRole === "Security" && !isApproved)) && (
        <button onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg shadow-sm transition-colors">
          Close
        </button>
      )}
    </div>
  )
}

export default ActionButtons
