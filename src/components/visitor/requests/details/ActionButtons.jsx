import React from "react"
import { Button } from "czero/react"
import useAuthz from "../../../../hooks/useAuthz"

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
  const { can } = useAuthz()
  const isPending = requestStatus === "Pending"
  const isApproved = requestStatus === "Approved"
  const isRejected = requestStatus === "Rejected"
  const canAllocateVisitors =
    ["Warden", "Associate Warden", "Hostel Supervisor"].includes(userRole) &&
    can("cap.visitors.allocate")
  const canApproveVisitors = userRole === "Admin" && can("cap.visitors.approve")

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
          <Button onClick={onCancelRequest} variant="danger" size="md">
            Cancel Request
          </Button>
          <Button onClick={onEditRequest} variant="secondary" size="md">
            Edit Request
          </Button>
        </>
      )}

      {/* Admin actions for pending requests */}
      {canApproveVisitors && isPending && (
        <>
          <Button onClick={onClose} variant="secondary" size="md">
            Close
          </Button>
          <Button onClick={onShowRejectForm} variant="danger" size="md">
            {showRejectForm ? "Cancel" : "Reject"}
          </Button>
          <Button onClick={onShowApproveForm} variant="primary" size="md">
            {showApproveForm ? "Cancel" : "Approve"}
          </Button>
        </>
      )}

      {/* Warden actions for approved requests */}
      {canAllocateVisitors && isApproved && (
        <>
          <Button onClick={onClose} variant="secondary" size="md">
            Close
          </Button>
          {!hasAllocatedRooms && (
            <Button onClick={onShowAllocationForm} variant="primary" size="md">
              Allocate Rooms
            </Button>
          )}
        </>
      )}

      {/* Security/Guard actions for approved requests */}
      {["Security", "Hostel Gate"].includes(userRole) && isApproved && (
        <>
          <Button onClick={onClose} variant="secondary" size="md">
            Close
          </Button>

          {hasAllocatedRooms && (
            <>
              {isCheckTimes && (
                <Button onClick={onShowCheckInForm} variant="warning" size="md">
                  Edit Check Times
                </Button>
              )}

              {isCheckInForm && (
                <Button onClick={onShowCheckInForm} variant="primary" size="md">
                  {showCheckInForm ? "Cancel" : "Check In"}
                </Button>
              )}

              {isCheckOutForm && (
                <Button onClick={onShowCheckInForm} variant="success" size="md">
                  {showCheckInForm ? "Cancel" : "Check Out"}
                </Button>
              )}
            </>
          )}
        </>
      )}

      {/* Default close button for other cases */}
      {((userRole !== "Admin" && userRole !== "Warden" && userRole !== "Associate Warden" && userRole !== "Hostel Supervisor" && userRole !== "Security" && userRole !== "Hostel Gate") ||
        (userRole === "Admin" && (!isPending || !canApproveVisitors)) ||
        (["Warden", "Associate Warden", "Hostel Supervisor"].includes(userRole) && (!canAllocateVisitors || !isApproved)) ||
        (["Security", "Hostel Gate"].includes(userRole) && !isApproved)) && (
          <Button onClick={onClose} variant="secondary" size="md">
            Close
          </Button>
        )}
    </div>
  )
}

export default ActionButtons
