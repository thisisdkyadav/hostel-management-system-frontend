import React, { useState, useEffect } from "react"
import { visitorApi } from "../../../service"
import { useAuth } from "../../../contexts/AuthProvider"
import { useGlobal } from "../../../contexts/GlobalProvider"
import { FaEye, FaMoneyBillWave } from "react-icons/fa"
import { Grid, Heading, HStack, IconCircle, Modal, Spinner, Surface, Text, useConfirm, VStack } from "@/components/ui"
import { Button } from "czero/react"

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
import PaymentInfoForm from "./details/PaymentInfoForm"
import PaymentInfoViewer from "./details/PaymentInfoViewer"
import PaymentInfoModal from "./PaymentInfoModal"

const VisitorRequestDetailsModal = ({ isOpen, onClose, requestId, onRefresh }) => {
  const confirm = useConfirm()
  const { user } = useAuth()
  const { hostelList = [] } = useGlobal()
  const canAllocateVisitors =
    ["Warden", "Associate Warden", "Hostel Supervisor"].includes(user?.role) &&
    true
  const canApproveVisitors = ["Admin"].includes(user?.role) && true
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
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

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
      setShowPaymentForm(false)
      setShowPaymentModal(false)
    }
  }, [isOpen, requestId])

  // Initialize forms and room allocation based on request data
  useEffect(() => {
    if (canAllocateVisitors && request?.status === "Approved" && (!request?.allocatedRooms || request?.allocatedRooms.length === 0)) {
      setShowAllocationForm(true)
    } else {
      setShowAllocationForm(false)
    }

    let nextIsUnitBased = false

    // Initialize room allocation form
    if (request?.hostelId) {
      // Find the hostel in the list to determine if it's unit-based
      const hostel = hostelList.find((h) => h._id === request.hostelId || h.name === request.hostelId)
      if (hostel) {
        setCurrentHostel(hostel)
        nextIsUnitBased = hostel.type === "unit-based" || false
        setIsUnitBased(nextIsUnitBased)
      }
    }

    // Initialize allocated rooms if they exist
    if (request?.allocatedRooms && request.allocatedRooms.length > 0) {
      setAllocatedRooms(request.allocatedRooms)
    } else {
      // Start with one empty room entry
      setAllocatedRooms([nextIsUnitBased ? ["", ""] : [""]])
    }
  }, [canAllocateVisitors, hostelList, request])

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
    if (await confirm({ message: "Are you sure you want to cancel this visitor request?", isDestructive: true })) {
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
    if (!canApproveVisitors) {
      alert("You do not have permission to approve requests.")
      return
    }

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
    if (!canAllocateVisitors) {
      alert("You do not have permission to allocate rooms.")
      return
    }

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

  // Payment info handler
  const handleSubmitPaymentInfo = async (paymentData) => {
    try {
      await visitorApi.submitPaymentInfo(requestId, paymentData)
      await fetchRequestDetails()
      setShowPaymentForm(false)
      alert("Payment information submitted successfully!")
    } catch (error) {
      console.error("Error submitting payment info:", error)
      alert("Failed to submit payment information. Please try again.")
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
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "16rem" }}>
          <div style={{ position: "relative", width: "var(--avatar-4xl)", height: "var(--avatar-4xl)" }}>
            <IconCircle size="100%" style={{ position: "absolute", top: "0", left: "0", border: "var(--border-4) solid var(--color-border-primary)" }}></IconCircle>
            <Spinner size="100%" thickness="thick" style={{ position: "absolute", top: "0", left: "0" }} />
          </div>
        </div>
      </Modal>
    )
  }

  // No request data
  if (!request) {
    return (
      <Modal title="Visitor Request Details" onClose={onClose} width={650}>
        <Surface padding={8} align="center">
          <Text color="muted" size="base">No request details found.</Text>
        </Surface>
      </Modal>
    )
  }

  // Main render with request data
  return (
    <Modal title="Visitor Request Details" onClose={onClose} width={650}>
      <VStack gap={6}>
        {/* Status Badge */}
        {["Admin", "Student"].includes(user.role) && <StatusBadge status={request.status} rejectionReason={request.rejectionReason} approvedAt={request.ApprovedAt} requestId={request._id} />}

        {/* student details */}
        <StudentDetails studentName={request.studentName} studentEmail={request.studentEmail} studentProfileImage={request.studentProfileImage} />

        {/* Visit Information and Accommodation Details */}
        <Grid min={250} gap={4}>
          <VisitInformation fromDate={request.fromDate} toDate={request.toDate} />

          {request.status === "Approved" && <AccommodationDetails hostelName={request.hostelName} allocatedRooms={request.allocatedRooms} />}
        </Grid>

        {/* Reason for Visit */}
        <VisitReason reason={request.reason} approvalInformation={request.approveInfo} isApproved={request.status === "Approved"} />

        {/* H2 Form Section */}
        {request.h2FormUrl && (
          <Surface bg="tertiary" padding={4} radius="lg">
            <HStack gap="none" align="center" justify="between">
              <HStack gap={3} align="center">
                <IconCircle size="var(--icon-2xl)" bg="brand">
                  <svg style={{ width: "var(--icon-md)", height: "var(--icon-md)", color: "var(--color-primary)" }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </IconCircle>
                <div>
                  <Heading as="h4" weight="medium" color="secondary">H2 Form Document</Heading>
                  <Text size="sm" color="muted">Guest Room Booking Form</Text>
                </div>
              </HStack>
              <Button onClick={() => setShowH2FormModal(true)} variant="primary" size="sm">
                <FaEye />
                View H2 Form
              </Button>
            </HStack>
          </Surface>
        )}

        {/* Visitors Information */}
        <VisitorInformation visitors={request.visitors} />

        {/* Payment Status */}
        {request.paymentStatus && (
          <Text as="div" size="sm" style={{ marginBottom: "var(--spacing-2)" }}>
            <Text as="span" weight="semibold" color="body" style={{ marginRight: "var(--spacing-2)" }}>Payment Status:</Text>
            <Surface as="span" bg={request.paymentStatus === "paid" ? "var(--color-success-bg)" : "var(--color-warning-bg)"} padding="var(--spacing-2) var(--badge-padding-sm)" radius="full" color={request.paymentStatus === "paid" ? "var(--color-success-text)" : "var(--color-warning-text)"} size="xs" weight="medium">
              {request.paymentStatus === "paid" ? "Paid" : "Pending"}
            </Surface>
          </Text>
        )}

        {/* Payment Link (Student only) */}
        {user.role === "Student" && ["Approved"].includes(request.status) && request.visitorPaymentLink && (
          <Text as="div" size="sm">
            <Text as="span" weight="semibold" color="brand" style={{ marginRight: "var(--spacing-2)" }}>Payment Link:</Text>
            <a
              href={request.visitorPaymentLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--color-primary)", textDecoration: "none", wordBreak: "break-all" }}
              onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
            >
              {request.visitorPaymentLink}
            </a>
          </Text>
        )}

        {/* Payment Information Submission (Student only) */}
        {user.role === "Student" && request.status === "Approved" && !request.paymentInfo.transactionId && !showPaymentForm && (
          <Surface bg="var(--color-info-bg-light)" padding={4} radius="lg" border="var(--border-1) solid var(--color-info-bg)">
            <HStack gap="none" align="center" justify="between">
              <HStack gap={3} align="center">
                <IconCircle size="var(--icon-2xl)" bg="info">
                  <svg style={{ width: "var(--icon-md)", height: "var(--icon-md)", color: "var(--color-primary)" }} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zM14 6a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h8zM6 8a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2h2z" />
                  </svg>
                </IconCircle>
                <div>
                  <Heading as="h4" weight="medium" color="info-text">Payment Information Required</Heading>
                  <Text size="sm" color="brand">Submit your payment details for verification</Text>
                </div>
              </HStack>
              <Button onClick={() => setShowPaymentForm(true)} variant="primary" size="sm">
                <FaMoneyBillWave />
                Submit Payment Info
              </Button>
            </HStack>
          </Surface>
        )}

        {/* Payment Information Form (Student only) */}
        {user.role === "Student" && request.status === "Approved" && showPaymentForm && <PaymentInfoForm onSubmit={handleSubmitPaymentInfo} onCancel={() => setShowPaymentForm(false)} expectedAmount={request.amount} />}

        {/* Payment Information Viewer (for authorized roles) */}
        {["Admin", "Warden", "Associate Warden", "Hostel Supervisor", "Student"].includes(user.role) && request.paymentInfo && <PaymentInfoViewer paymentInfo={request.paymentInfo} onViewScreenshot={() => setShowPaymentModal(true)} />}

        {/* Security Check-in/out (if applicable) */}
        {request.status === "Approved" && request.checkInTime && <SecurityCheck checkInTime={request.checkInTime} checkOutTime={request.checkOutTime} />}

        {/* Security Check-in Form (for Security/Guard) */}
        {["Security", "Hostel Gate"].includes(user.role) && request.status === "Approved" && request.allocatedRooms && request.allocatedRooms.length > 0 && showCheckInForm && (
          <CheckInOutForm requestId={requestId} visitorInfo={getVisitorInfo()} checkInTime={request.checkInTime} checkOutTime={request.checkOutTime} onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} onUpdateTimes={handleUpdateCheckTimes} onCancel={() => setShowCheckInForm(false)} />
        )}

        {/* Room Allocation Form (for Warden) */}
        {canAllocateVisitors && request.status === "Approved" && showAllocationForm && (
          <RoomAllocationForm isUnitBased={isUnitBased} allocatedRooms={allocatedRooms} onRoomChange={handleRoomChange} onAddRoom={addRoomField} onRemoveRoom={removeRoomField} onCancel={() => setShowAllocationForm(false)} onSubmit={handleAllocateRooms} />
        )}

        {/* Approve Form (for Admin) */}
        {canApproveVisitors && request.status === "Pending" && showApproveForm && (
          <ApprovalForm selectedHostel={selectedHostel} onHostelChange={setSelectedHostel} approvalInformation={approvalInformation} onApprovalInformationChange={setApprovalInformation} onCancel={() => setShowApproveForm(false)} onSubmit={handleApproveRequest} hostelList={hostelList} />
        )}

        {/* Reject Form (for Admin) */}
        {canApproveVisitors && request.status === "Pending" && showRejectForm && <RejectionForm rejectionReason={rejectionReason} onReasonChange={setRejectionReason} onCancel={() => setShowRejectForm(false)} onSubmit={handleRejectRequest} />}

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
      </VStack>

      <EditVisitorRequestModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
        }}
        request={request}
        onRefresh={onRefresh}
      />

      <H2FormViewerModal isOpen={showH2FormModal} onClose={() => setShowH2FormModal(false)} h2FormUrl={request?.h2FormUrl} />

      <PaymentInfoModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} paymentScreenshot={request?.paymentInfo?.screenshot} />
    </Modal>
  )
}

export default VisitorRequestDetailsModal
