import React, { useState, useEffect } from "react"
import Modal from "../../common/Modal"
import { visitorApi } from "../../../services/visitorApi"
import { useAuth } from "../../../contexts/AuthProvider"
import { useGlobal } from "../../../contexts/GlobalProvider"

// Import smaller components
import StatusBadge from "./details/StatusBadge"
import VisitInformation from "./details/VisitInformation"
import AccommodationDetails from "./details/AccommodationDetails"
import VisitReason from "./details/VisitReason"
import VisitorInformation from "./details/VisitorInformation"
import SecurityCheck from "./details/SecurityCheck"
import RoomAllocationForm from "./details/RoomAllocationForm"
import ApprovalForm from "./details/ApprovalForm"
import RejectionForm from "./details/RejectionForm"
import ActionButtons from "./details/ActionButtons"
import CheckInOutForm from "./details/CheckInOutForm"
import EditVisitorRequestModal from "./EditVisitorRequestModal"

const VisitorRequestDetailsModal = ({ isOpen, onClose, requestId, onRefresh }) => {
  const { user } = useAuth()
  const { hostelList = [] } = useGlobal()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedHostel, setSelectedHostel] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [showApproveForm, setShowApproveForm] = useState(false)

  const [showAllocationForm, setShowAllocationForm] = useState(false)
  const [isUnitBased, setIsUnitBased] = useState(false)
  const [allocatedRooms, setAllocatedRooms] = useState([])
  const [currentHostel, setCurrentHostel] = useState(null)

  // New states for Security functionality
  const [showCheckInForm, setShowCheckInForm] = useState(false)
  const [showCheckOutForm, setShowCheckOutForm] = useState(false)
  const [processingAction, setProcessingAction] = useState(false)

  const [showEditModal, setShowEditModal] = useState(false)

  // Fetch request details from API
  const fetchRequestDetails = async () => {
    if (!requestId) return

    setLoading(true)
    try {
      const response = await visitorApi.getVisitorRequestById(requestId)
      setRequest(response.data)
    } catch (error) {
      console.error("Error fetching request details:", error)
    } finally {
      setLoading(false)
    }
  }

  // Effect to fetch data when modal opens
  useEffect(() => {
    if (isOpen && requestId) {
      fetchRequestDetails()
    } else {
      setRequest(null)
      setLoading(false)
    }
  }, [isOpen, requestId])

  // Initialize forms and room allocation based on request data
  useEffect(() => {
    if (user.role === "Warden" && request?.status === "Approved" && (!request?.allocatedRooms || request?.allocatedRooms.length === 0)) {
      setShowAllocationForm(true)
    } else {
      setShowAllocationForm(false)
    }

    // Initialize room allocation form
    if (request?.hostelId) {
      // Find the hostel in the list to determine if it's unit-based
      const hostel = hostelList.find((h) => h._id === request.hostelId || h.name === request.hostelId)
      if (hostel) {
        setCurrentHostel(hostel)
        setIsUnitBased(hostel.type === "unit-based" || false)
      }
    }

    // Initialize allocated rooms if they exist
    if (request?.allocatedRooms && request.allocatedRooms.length > 0) {
      setAllocatedRooms(request.allocatedRooms)
    } else {
      // Start with one empty room entry
      setAllocatedRooms([isUnitBased ? ["", ""] : [""]])
    }
  }, [request, user.role, hostelList])

  if (!isOpen) return null

  // Room allocation handlers
  const addRoomField = () => {
    setAllocatedRooms([...allocatedRooms, isUnitBased ? ["", ""] : [""]])
  }

  const removeRoomField = (index) => {
    const updatedRooms = [...allocatedRooms]
    updatedRooms.splice(index, 1)
    setAllocatedRooms(updatedRooms)
  }

  const handleRoomChange = (index, fieldIndex, value) => {
    const updatedRooms = [...allocatedRooms]
    updatedRooms[index][fieldIndex] = value
    setAllocatedRooms(updatedRooms)
  }

  // API action handlers
  const handleCancelRequest = async () => {
    if (window.confirm("Are you sure you want to cancel this visitor request?")) {
      try {
        await visitorApi.cancelVisitorRequest(requestId)
        onRefresh()
        onClose()
      } catch (error) {
        console.error("Error canceling request:", error)
        alert("Failed to cancel request. Please try again.")
      }
    }
  }

  const handleApproveRequest = async () => {
    if (!selectedHostel) {
      alert("Please select a hostel to assign for this visit.")
      return
    }

    try {
      await visitorApi.approveVisitorRequest(requestId, selectedHostel)
      onRefresh()
      onClose()
    } catch (error) {
      console.error("Error approving request:", error)
      alert("Failed to approve request. Please try again.")
    }
  }

  const handleRejectRequest = async () => {
    try {
      await visitorApi.rejectVisitorRequest(requestId, rejectionReason)
      onRefresh()
      onClose()
    } catch (error) {
      console.error("Error rejecting request:", error)
      alert("Failed to reject request. Please try again.")
    }
  }

  const handleAllocateRooms = async () => {
    // Validate rooms
    const isValid = allocatedRooms.every((room) => (isUnitBased ? room[0].trim() !== "" && room[1].trim() !== "" : room[0].trim() !== ""))

    if (!isValid) {
      alert("Please fill in all room details")
      return
    }

    try {
      await visitorApi.allocateRooms(requestId, allocatedRooms)
      onRefresh()
      onClose()
    } catch (error) {
      console.error("Error allocating rooms:", error)
      alert(error.message || "Failed to allocate rooms. Please try again.")
    }
  }

  // Security handlers (new)
  const handleCheckIn = async (checkInData) => {
    setProcessingAction(true)
    try {
      await visitorApi.checkInVisitor(requestId, checkInData)
      await fetchRequestDetails()
      setShowCheckInForm(false)
    } catch (error) {
      console.error("Error checking in visitor:", error)
      alert("Failed to check in visitor. Please try again.")
    } finally {
      setProcessingAction(false)
    }
  }

  const handleCheckOut = async (checkOutData) => {
    setProcessingAction(true)
    try {
      await visitorApi.checkOutVisitor(requestId, checkOutData)
      await fetchRequestDetails()
      setShowCheckOutForm(false)
    } catch (error) {
      console.error("Error checking out visitor:", error)
      alert("Failed to check out visitor. Please try again.")
    } finally {
      setProcessingAction(false)
    }
  }

  const handleUpdateCheckTimes = async (checkData) => {
    setProcessingAction(true)
    try {
      await visitorApi.updateCheckTimes(requestId, checkData)
      await fetchRequestDetails()
      setShowCheckInForm(false)
      setShowCheckOutForm(false)
    } catch (error) {
      console.error("Error updating check times:", error)
      alert("Failed to update check times. Please try again.")
    } finally {
      setProcessingAction(false)
    }
  }

  // UI toggle handlers
  const toggleApproveForm = () => {
    setShowApproveForm(!showApproveForm)
    setShowRejectForm(false)
  }

  const toggleRejectForm = () => {
    setShowRejectForm(!showRejectForm)
    setShowApproveForm(false)
  }

  const toggleCheckInForm = () => {
    setShowCheckInForm(!showCheckInForm)
    setShowCheckOutForm(false)
  }

  const toggleCheckOutForm = () => {
    setShowCheckOutForm(!showCheckOutForm)
    setShowCheckInForm(false)
  }

  // Function to get visitor names for the check-in/out form
  const getVisitorInfo = () => {
    if (!request.visitors || request.visitors.length === 0) return "No visitors listed"

    return request.visitors.map((visitor) => `${visitor.name} (${visitor.idType}: ${visitor.idNumber})`).join(", ")
  }

  // Loading state
  if (loading) {
    return (
      <Modal title="Visitor Request Details" onClose={onClose} width={650}>
        <div className="flex justify-center items-center h-64">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-[#1360AB] rounded-full animate-spin border-t-transparent"></div>
          </div>
        </div>
      </Modal>
    )
  }

  // No request data
  if (!request) {
    return (
      <Modal title="Visitor Request Details" onClose={onClose} width={650}>
        <div className="p-8 text-center">
          <p className="text-gray-500">No request details found.</p>
        </div>
      </Modal>
    )
  }

  // Main render with request data
  return (
    <Modal title="Visitor Request Details" onClose={onClose} width={650}>
      <div className="space-y-6">
        {/* Status Badge */}
        {["Admin", "Student"].includes(user.role) && <StatusBadge status={request.status} rejectionReason={request.rejectionReason} approvedAt={request.ApprovedAt} requestId={request._id} />}

        {/* Visit Information and Accommodation Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <VisitInformation fromDate={request.fromDate} toDate={request.toDate} />

          {request.status === "Approved" && <AccommodationDetails hostelName={request.hostelName} allocatedRooms={request.allocatedRooms} />}
        </div>

        {/* Reason for Visit */}
        <VisitReason reason={request.reason} />

        {/* Visitors Information */}
        <VisitorInformation visitors={request.visitors} />

        {/* Security Check-in/out (if applicable) */}
        {request.status === "Approved" && request.checkInTime && <SecurityCheck checkInTime={request.checkInTime} checkOutTime={request.checkOutTime} />}

        {/* Security Check-in Form (for Security/Guard) */}
        {user.role === "Security" && request.status === "Approved" && request.allocatedRooms && request.allocatedRooms.length > 0 && showCheckInForm && (
          <CheckInOutForm requestId={requestId} visitorInfo={getVisitorInfo()} checkInTime={request.checkInTime} checkOutTime={request.checkOutTime} onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} onUpdateTimes={handleUpdateCheckTimes} onCancel={() => setShowCheckInForm(false)} />
        )}

        {/* Room Allocation Form (for Warden) */}
        {user.role === "Warden" && request.status === "Approved" && showAllocationForm && (
          <RoomAllocationForm isUnitBased={isUnitBased} allocatedRooms={allocatedRooms} onRoomChange={handleRoomChange} onAddRoom={addRoomField} onRemoveRoom={removeRoomField} onCancel={() => setShowAllocationForm(false)} onSubmit={handleAllocateRooms} />
        )}

        {/* Approve Form (for Admin) */}
        {["Admin"].includes(user.role) && request.status === "Pending" && showApproveForm && <ApprovalForm selectedHostel={selectedHostel} onHostelChange={setSelectedHostel} onCancel={() => setShowApproveForm(false)} onSubmit={handleApproveRequest} hostelList={hostelList} />}

        {/* Reject Form (for Admin) */}
        {["Admin"].includes(user.role) && request.status === "Pending" && showRejectForm && <RejectionForm rejectionReason={rejectionReason} onReasonChange={setRejectionReason} onCancel={() => setShowRejectForm(false)} onSubmit={handleRejectRequest} />}

        {/* Action Buttons */}
        <ActionButtons
          userRole={user.role}
          requestStatus={request.status}
          onClose={onClose}
          onCancelRequest={handleCancelRequest}
          onEditRequest={() => setShowEditModal(true)}
          onShowApproveForm={toggleApproveForm}
          onShowRejectForm={toggleRejectForm}
          showApproveForm={showApproveForm}
          showRejectForm={showRejectForm}
          onShowAllocationForm={() => setShowAllocationForm(true)}
          hasAllocatedRooms={request.allocatedRooms && request.allocatedRooms.length > 0}
          // Security-specific props
          onShowCheckInForm={toggleCheckInForm}
          onShowCheckOutForm={toggleCheckOutForm}
          showCheckInForm={showCheckInForm}
          isCheckInForm={!request.checkInTime}
          isCheckOutForm={request.checkInTime && !request.checkOutTime}
          isCheckTimes={request.checkInTime && request.checkOutTime}
        />
      </div>

      <EditVisitorRequestModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
        }}
        request={request}
        onRefresh={onRefresh}
      />
    </Modal>
  )
}

export default VisitorRequestDetailsModal
