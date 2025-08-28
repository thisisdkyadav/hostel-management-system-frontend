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
import StudentDetails from "./details/StudentDetails"
import H2FormViewerModal from "./H2FormViewerModal"

const VisitorRequestDetailsModal = ({ isOpen, onClose, requestId, onRefresh }) => {
  const { user, canAccess } = useAuth()
  const { hostelList = [] } = useGlobal()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedHostel, setSelectedHostel] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [showApproveForm, setShowApproveForm] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [approvalInformation, setApprovalInformation] = useState("")

  const [showAllocationForm, setShowAllocationForm] = useState(false)
  const [isUnitBased, setIsUnitBased] = useState(false)
  const [allocatedRooms, setAllocatedRooms] = useState([])
  const [currentHostel, setCurrentHostel] = useState(null)

  // New states for Security functionality
  const [showCheckInForm, setShowCheckInForm] = useState(false)
  const [showCheckOutForm, setShowCheckOutForm] = useState(false)
  const [processingAction, setProcessingAction] = useState(false)

  const [showEditModal, setShowEditModal] = useState(false)
  const [showH2FormModal, setShowH2FormModal] = useState(false)

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
      setSelectedHostel("")
      setRejectionReason("")
      setShowRejectForm(false)
      setShowApproveForm(false)
      setPaymentAmount("")
      setApprovalInformation("")
      setShowAllocationForm(false)
      setAllocatedRooms([])
      setShowCheckInForm(false)
      setShowCheckOutForm(false)
    }
  }, [isOpen, requestId])

  // Initialize forms and room allocation based on request data
  useEffect(() => {
    if (canAccess("visitors", "react") && ["Warden", "Associate Warden", "Hostel Supervisor"].includes(user.role) && request?.status === "Approved" && (!request?.allocatedRooms || request?.allocatedRooms.length === 0)) {
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
      const amountToSend = paymentAmount.trim() !== "" ? Number(paymentAmount) : null
      await visitorApi.approveVisitorRequest(requestId, selectedHostel, amountToSend, approvalInformation)
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
    if (showApproveForm) {
      setPaymentAmount("")
      setApprovalInformation("")
    }
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

        {/* student details */}
        <StudentDetails studentName={request.studentName} studentEmail={request.studentEmail} studentProfileImage={request.studentProfileImage} />

        {/* Visit Information and Accommodation Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <VisitInformation fromDate={request.fromDate} toDate={request.toDate} />

          {request.status === "Approved" && <AccommodationDetails hostelName={request.hostelName} allocatedRooms={request.allocatedRooms} />}
        </div>

        {/* Reason for Visit */}
        <VisitReason reason={request.reason} approvalInformation={request.approveInfo} isApproved={request.status === "Approved"} />

        {/* H2 Form Section */}
        {request.h2FormUrl && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#1360AB]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">H2 Form Document</h4>
                  <p className="text-sm text-gray-600">Guest Room Booking Form</p>
                </div>
              </div>
              <button onClick={() => setShowH2FormModal(true)} className="px-4 py-2 bg-[#1360AB] text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                <span>View H2 Form</span>
              </button>
            </div>
          </div>
        )}

        {/* Visitors Information */}
        <VisitorInformation visitors={request.visitors} />

        {/* Payment Status */}
        {request.paymentStatus && (
          <div className="text-sm mb-2">
            <span className="font-semibold text-gray-700 mr-2">Payment Status:</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${request.paymentStatus === "paid" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}`}>{request.paymentStatus === "paid" ? "Paid" : "Pending"}</span>
          </div>
        )}

        {/* Payment Link (Student only) */}
        {user.role === "Student" && ["Approved"].includes(request.status) && request.visitorPaymentLink && (
          <div className="text-sm">
            <span className="font-semibold text-blue-700 mr-2">Payment Link:</span>
            <a href={request.visitorPaymentLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
              {request.visitorPaymentLink}
            </a>
          </div>
        )}

        {/* Security Check-in/out (if applicable) */}
        {request.status === "Approved" && request.checkInTime && <SecurityCheck checkInTime={request.checkInTime} checkOutTime={request.checkOutTime} />}

        {/* Security Check-in Form (for Security/Guard) */}
        {["Security", "Hostel Gate"].includes(user.role) && request.status === "Approved" && request.allocatedRooms && request.allocatedRooms.length > 0 && showCheckInForm && (
          <CheckInOutForm requestId={requestId} visitorInfo={getVisitorInfo()} checkInTime={request.checkInTime} checkOutTime={request.checkOutTime} onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} onUpdateTimes={handleUpdateCheckTimes} onCancel={() => setShowCheckInForm(false)} />
        )}

        {/* Room Allocation Form (for Warden) */}
        {canAccess("visitors", "react") && ["Warden", "Associate Warden", "Hostel Supervisor"].includes(user.role) && request.status === "Approved" && showAllocationForm && (
          <RoomAllocationForm isUnitBased={isUnitBased} allocatedRooms={allocatedRooms} onRoomChange={handleRoomChange} onAddRoom={addRoomField} onRemoveRoom={removeRoomField} onCancel={() => setShowAllocationForm(false)} onSubmit={handleAllocateRooms} />
        )}

        {/* Approve Form (for Admin) */}
        {["Admin"].includes(user.role) && request.status === "Pending" && showApproveForm && (
          <ApprovalForm selectedHostel={selectedHostel} onHostelChange={setSelectedHostel} approvalInformation={approvalInformation} onApprovalInformationChange={setApprovalInformation} onCancel={() => setShowApproveForm(false)} onSubmit={handleApproveRequest} hostelList={hostelList} />
        )}

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

      <H2FormViewerModal isOpen={showH2FormModal} onClose={() => setShowH2FormModal(false)} h2FormUrl={request?.h2FormUrl} />
    </Modal>
  )
}

export default VisitorRequestDetailsModal
