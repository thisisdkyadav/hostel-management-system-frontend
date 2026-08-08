import { useState, useEffect } from "react"
import { visitorApi } from "../../../service"
import { useAuth } from "../../../contexts/AuthProvider"
import { useGlobal } from "../../../contexts/GlobalProvider"
import { Banknote, CreditCard, Eye, FileSearch, FileText, Wallet } from "lucide-react"
import {
  Badge,
  Button,
  DetailSection,
  EmptyState,
  Grid,
  InfoRow,
  LoadingState,
  Modal,
  Text,
  VStack,
  useConfirm,
  useToast,
} from "hzero"

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
  const { toast } = useToast()
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
  const [, setCurrentHostel] = useState(null)

  // New states for Security functionality
  const [showCheckInForm, setShowCheckInForm] = useState(false)
  const [showCheckOutForm, setShowCheckOutForm] = useState(false)
  const [, setProcessingAction] = useState(false)

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
    if (await confirm({ title: "Cancel this visitor request?", message: "The request will be withdrawn and the visit won't go ahead.", confirmText: "Cancel request", cancelText: "Keep request", isDestructive: true })) {
      try {
        await visitorApi.cancelVisitorRequest(requestId)
        onRefresh()
        onClose()
      } catch (error) {
        console.error("Error canceling request:", error)
        toast.error("Couldn't cancel the request. Please try again.")
      }
    }
  }

  const handleApproveRequest = async () => {
    if (!canApproveVisitors) {
      toast.error("You don't have permission to approve requests.")
      return
    }

    if (!selectedHostel) {
      toast.warning("Select a hostel to assign for this visit.")
      return
    }

    try {
      const amountToSend = paymentAmount.trim() !== "" ? Number(paymentAmount) : null
      await visitorApi.approveVisitorRequest(requestId, selectedHostel, amountToSend, approvalInformation)
      onRefresh()
      onClose()
    } catch (error) {
      console.error("Error approving request:", error)
      toast.error("Couldn't approve the request. Please try again.")
    }
  }

  const handleRejectRequest = async () => {
    try {
      await visitorApi.rejectVisitorRequest(requestId, rejectionReason)
      onRefresh()
      onClose()
    } catch (error) {
      console.error("Error rejecting request:", error)
      toast.error("Couldn't reject the request. Please try again.")
    }
  }

  const handleAllocateRooms = async () => {
    if (!canAllocateVisitors) {
      toast.error("You don't have permission to allocate rooms.")
      return
    }

    // Validate rooms
    const isValid = allocatedRooms.every((room) => (isUnitBased ? room[0].trim() !== "" && room[1].trim() !== "" : room[0].trim() !== ""))

    if (!isValid) {
      toast.warning("Fill in every room detail before allocating.")
      return
    }

    try {
      await visitorApi.allocateRooms(requestId, allocatedRooms)
      onRefresh()
      onClose()
    } catch (error) {
      console.error("Error allocating rooms:", error)
      toast.error(error.message || "Couldn't allocate rooms. Please try again.")
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
      toast.error("Couldn't check the visitor in. Please try again.")
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
      toast.error("Couldn't check the visitor out. Please try again.")
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
      toast.error("Couldn't update the check-in and check-out times. Please try again.")
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
      toast.success("Payment information submitted.")
    } catch (error) {
      console.error("Error submitting payment info:", error)
      toast.error("Couldn't submit the payment information. Please try again.")
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
      <Modal title="Visitor request details" onClose={onClose} width={650}>
        <LoadingState message="Loading request details" />
      </Modal>
    )
  }

  // No request data
  if (!request) {
    return (
      <Modal title="Visitor request details" onClose={onClose} width={650}>
        <EmptyState icon={FileSearch} title="No request details found" message="We couldn't load this visitor request. Close this window and open it again." />
      </Modal>
    )
  }

  const showPaymentStatus = Boolean(request.paymentStatus)
  const showPaymentLink = user.role === "Student" && ["Approved"].includes(request.status) && Boolean(request.visitorPaymentLink)

  // Main render with request data
  return (
    <Modal title="Visitor request details" onClose={onClose} width={650}>
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
          <DetailSection
            title="H2 form document"
            icon={FileText}
            actions={
              <Button onClick={() => setShowH2FormModal(true)} variant="primary" size="sm">
                <Eye size={15} />
                View H2 form
              </Button>
            }
          >
            <Text size="sm" color="muted">Guest room booking form</Text>
          </DetailSection>
        )}

        {/* Visitors Information */}
        <VisitorInformation visitors={request.visitors} />

        {/* Payment Status and Payment Link (link is Student only) */}
        {(showPaymentStatus || showPaymentLink) && (
          <DetailSection title="Payment" icon={Wallet}>
            {showPaymentStatus && (
              <InfoRow
                label="Payment status"
                value={
                  <Badge variant={request.paymentStatus === "paid" ? "success" : "warning"} size="small">
                    {request.paymentStatus === "paid" ? "Paid" : "Pending"}
                  </Badge>
                }
              />
            )}
            {showPaymentLink && (
              <InfoRow
                label="Payment link"
                value={
                  <Text as="a" size="sm" color="brand" href={request.visitorPaymentLink} target="_blank" rel="noopener noreferrer" style={{ wordBreak: "break-all" }}>
                    {request.visitorPaymentLink}
                  </Text>
                }
              />
            )}
          </DetailSection>
        )}

        {/* Payment Information Submission (Student only) */}
        {user.role === "Student" && request.status === "Approved" && !request.paymentInfo.transactionId && !showPaymentForm && (
          <DetailSection
            title="Payment information required"
            icon={CreditCard}
            tone="info"
            actions={
              <Button onClick={() => setShowPaymentForm(true)} variant="primary" size="sm">
                <Banknote size={15} />
                Submit payment info
              </Button>
            }
          >
            <Text size="sm" color="muted">Submit your payment details so we can verify them.</Text>
          </DetailSection>
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
