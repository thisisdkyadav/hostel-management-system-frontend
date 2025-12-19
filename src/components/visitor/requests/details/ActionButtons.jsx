import React from "react"
import { useAuth } from "../../../../contexts/AuthProvider"

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
  const { user, canAccess } = useAuth()
  const isPending = requestStatus === "Pending"
  const isApproved = requestStatus === "Approved"
  const isRejected = requestStatus === "Rejected"

  const buttonBaseStyle = {
    padding: "var(--spacing-2) var(--spacing-4)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-sm)",
    transition: "var(--transition-colors)",
    fontSize: "var(--font-size-base)",
    fontWeight: "var(--font-weight-medium)",
    border: "none",
    cursor: "pointer",
  }

  const closeButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: "var(--color-bg-muted)",
    color: "var(--color-text-body)",
  }

  const cancelButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: "var(--color-danger)",
    color: "var(--color-white)",
  }

  const editButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: "var(--color-bg-muted)",
    color: "var(--color-text-body)",
  }

  const rejectButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: showRejectForm ? "var(--color-danger-hover)" : "var(--color-danger)",
    color: "var(--color-white)",
  }

  const approveButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: showApproveForm ? "var(--color-primary-hover)" : "var(--color-primary)",
    color: "var(--color-white)",
  }

  const allocateButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: "var(--color-primary)",
    color: "var(--color-white)",
  }

  const checkInButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: showCheckInForm ? "var(--color-primary-hover)" : "var(--color-primary)",
    color: "var(--color-white)",
  }

  const checkOutButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: showCheckInForm ? "var(--color-success-hover)" : "var(--color-success)",
    color: "var(--color-white)",
  }

  const editCheckTimesButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: "var(--color-warning)",
    color: "var(--color-white)",
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: "var(--spacing-3)", paddingTop: "var(--spacing-4)", borderTop: `var(--border-1) solid var(--color-border-primary)`, }} >
      {/* Student actions */}
      {userRole === "Student" && isPending && (
        <>
          <button onClick={onCancelRequest} style={cancelButtonStyle}>
            Cancel Request
          </button>
          <button onClick={onEditRequest} style={editButtonStyle}>
            Edit Request
          </button>
        </>
      )}

      {/* Admin actions for pending requests */}
      {userRole === "Admin" && isPending && (
        <>
          <button onClick={onClose} style={closeButtonStyle}>
            Close
          </button>
          <button onClick={onShowRejectForm} style={rejectButtonStyle}>
            {showRejectForm ? "Cancel" : "Reject"}
          </button>
          <button onClick={onShowApproveForm} style={approveButtonStyle}>
            {showApproveForm ? "Cancel" : "Approve"}
          </button>
        </>
      )}

      {/* Warden actions for approved requests */}
      {canAccess("visitors", "react") && ["Warden", "Associate Warden", "Hostel Supervisor"].includes(userRole) && isApproved && (
        <>
          <button onClick={onClose} style={closeButtonStyle}>
            Close
          </button>
          {!hasAllocatedRooms && (
            <button onClick={onShowAllocationForm} style={allocateButtonStyle}>
              Allocate Rooms
            </button>
          )}
        </>
      )}

      {/* Security/Guard actions for approved requests */}
      {["Security", "Hostel Gate"].includes(userRole) && isApproved && (
        <>
          <button onClick={onClose} style={closeButtonStyle}>
            Close
          </button>

          {hasAllocatedRooms && (
            <>
              {isCheckTimes && (
                <button onClick={onShowCheckInForm} style={editCheckTimesButtonStyle}>
                  Edit Check Times
                </button>
              )}

              {isCheckInForm && (
                <button onClick={onShowCheckInForm} style={checkInButtonStyle}>
                  {showCheckInForm ? "Cancel" : "Check In"}
                </button>
              )}

              {isCheckOutForm && (
                <button onClick={onShowCheckInForm} style={checkOutButtonStyle}>
                  {showCheckInForm ? "Cancel" : "Check Out"}
                </button>
              )}
            </>
          )}
        </>
      )}

      {/* Default close button for other cases */}
      {((userRole !== "Admin" && userRole !== "Warden" && userRole !== "Associate Warden" && userRole !== "Hostel Supervisor" && userRole !== "Security" && userRole !== "Hostel Gate") ||
        (userRole === "Admin" && !isPending) ||
        (canAccess("visitors", "react") && ["Warden", "Associate Warden", "Hostel Supervisor"].includes(userRole) && !isApproved) ||
        (["Security", "Hostel Gate"].includes(userRole) && !isApproved)) && (
        <button onClick={onClose} style={closeButtonStyle}>
          Close
        </button>
      )}
    </div>
  )
}

export default ActionButtons
