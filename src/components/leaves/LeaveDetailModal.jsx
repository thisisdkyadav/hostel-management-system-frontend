import { useState } from "react"
import { Calendar, Check, FileText, LogIn, User, X } from "lucide-react"
import {
  Alert,
  Badge,
  Button,
  DetailSection,
  Field,
  HStack,
  InfoRow,
  Modal,
  Text,
  Textarea,
  VStack,
} from "hzero"
import { leaveApi } from "../../service"

const STATUS_VARIANT = { Approved: "success", Rejected: "danger" }

const shortDate = (value) => new Date(value).toLocaleDateString()

const longDate = (value) =>
  new Date(value).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

const LeaveDetailModal = ({ leave, onClose, onUpdated, isAdmin, isSelfView }) => {
  const [showDecisionModal, setShowDecisionModal] = useState(false)
  const [decisionType, setDecisionType] = useState("approve")
  const [decisionText, setDecisionText] = useState("")
  const [decisionLoading, setDecisionLoading] = useState(false)
  const [decisionError, setDecisionError] = useState(null)

  // Join leave states
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [joinInfo, setJoinInfo] = useState("")
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinError, setJoinError] = useState(null)

  const isPending = leave.status === "Pending" || !leave.status
  const isApproved = leave.status === "Approved"
  const isJoined = leave.joinStatus === "Joined"
  const canModifyStatus = isAdmin && isPending && !isSelfView
  const canJoinLeave = isSelfView && isApproved && !isJoined

  const status = leave.status || "Pending"
  const isApprove = decisionType === "approve"
  const durationDays =
    Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1
  const dateRange = `${shortDate(leave.startDate)} – ${shortDate(leave.endDate)}`

  const openDecisionModal = (type) => {
    setDecisionType(type)
    setDecisionText("")
    setDecisionError(null)
    setShowDecisionModal(true)
  }

  const submitDecision = async () => {
    if (!decisionText.trim()) {
      setDecisionError(decisionType === "approve" ? "Please provide approval info" : "Please provide a reason for rejection")
      return
    }
    try {
      setDecisionLoading(true)
      setDecisionError(null)
      const id = leave.id || leave._id
      if (decisionType === "approve") {
        await leaveApi.approveLeave(id, { approvalInfo: decisionText.trim() })
      } else {
        await leaveApi.rejectLeave(id, { reasonForRejection: decisionText.trim() })
      }
      setShowDecisionModal(false)
      onUpdated?.()
    } catch (e) {
      setDecisionError(e.message || (decisionType === "approve" ? "Failed to approve" : "Failed to reject"))
    } finally {
      setDecisionLoading(false)
    }
  }

  const submitJoinLeave = async () => {
    if (!joinInfo.trim()) {
      setJoinError("Please provide join information")
      return
    }
    try {
      setJoinLoading(true)
      setJoinError(null)
      const id = leave.id || leave._id
      await leaveApi.joinLeave(id, { joinInfo: joinInfo.trim() })
      setShowJoinModal(false)
      onUpdated?.()
    } catch (e) {
      setJoinError(e.message || "Failed to join leave")
    } finally {
      setJoinLoading(false)
    }
  }

  return (
    <>
      <Modal
        title="Leave request details"
        onClose={onClose}
        width={800}
        footer={
          <>
            <Button onClick={onClose} variant="secondary" size="md">
              Close
            </Button>

            {canJoinLeave && (
              <Button onClick={() => setShowJoinModal(true)} variant="info" size="md">
                Join leave
              </Button>
            )}

            {canModifyStatus && (
              <>
                <Button onClick={() => openDecisionModal("reject")} variant="danger" size="md">
                  Reject
                </Button>
                <Button onClick={() => openDecisionModal("approve")} variant="success" size="md">
                  Approve
                </Button>
              </>
            )}
          </>
        }
      >
        <VStack gap="large">
          <HStack gap={3} align="center" justify="between" wrap>
            <Text size="sm" color="muted">
              {leave.createdAt ? `Submitted on ${shortDate(leave.createdAt)}` : "Submission date not recorded"}
            </Text>
            <Badge variant={STATUS_VARIANT[status] || "warning"}>{status}</Badge>
          </HStack>

          <DetailSection title="Requested by" icon={User} tone="primary">
            <InfoRow
              label="Name"
              value={leave.requestedBy?.name || leave.user?.name || leave.userId?.name || "Me"}
            />
            {leave.userId?.email && <InfoRow label="Email" value={leave.userId.email} />}
          </DetailSection>

          <DetailSection title="Leave period" icon={Calendar}>
            <InfoRow label="Start date" value={longDate(leave.startDate)} />
            <InfoRow label="End date" value={longDate(leave.endDate)} />
            <InfoRow label="Duration" value={`${durationDays} day(s)`} strong />
          </DetailSection>

          <DetailSection title="Reason for leave" icon={FileText}>
            <Text leading="var(--line-height-relaxed)">{leave.reason}</Text>
          </DetailSection>

          {isJoined && leave.joinInfo && (
            <DetailSection title="Join information" icon={LogIn} tone="info">
              <InfoRow label="Status" value={<Badge variant="info" size="small">Joined</Badge>} />
              <Text leading="var(--line-height-relaxed)">{leave.joinInfo}</Text>
            </DetailSection>
          )}
        </VStack>
      </Modal>

      {/* Decision Modal (Approve/Reject) */}
      {showDecisionModal && (
        <Modal
          title={
            <HStack inline gap="small" align="center" color={isApprove ? "success-text" : "danger-text"}>
              {isApprove ? <Check size={20} /> : <X size={20} />}
              {isApprove ? "Approve leave request" : "Reject leave request"}
            </HStack>
          }
          onClose={() => setShowDecisionModal(false)}
          width={650}
          footer={
            <>
              <Button type="button" onClick={() => setShowDecisionModal(false)} variant="secondary" size="md">
                Cancel
              </Button>
              <Button
                type="button"
                onClick={submitDecision}
                variant={isApprove ? "success" : "danger"}
                size="md"
                disabled={decisionLoading}
                loading={decisionLoading}
              >
                {isApprove ? "Confirm approval" : "Confirm rejection"}
              </Button>
            </>
          }
        >
          <VStack gap="large">
            {decisionError && <Alert type="error">{decisionError}</Alert>}

            <DetailSection title="Leave request" tone={isApprove ? "success" : "danger"}>
              <InfoRow
                label="Requested by"
                value={leave.requestedBy?.name || leave.user?.name || leave.userId?.name || "User"}
              />
              <InfoRow label="Dates" value={dateRange} />
              <InfoRow label="Duration" value={`${durationDays} day(s)`} strong />
            </DetailSection>

            <Field
              label={isApprove ? "Approval notes" : "Reason for rejection"}
              required
              help={
                isApprove
                  ? "This note goes to the employee along with the approval."
                  : "This reason tells the employee why their request was declined."
              }
            >
              <Textarea
                value={decisionText}
                onChange={(e) => setDecisionText(e.target.value)}
                placeholder={
                  isApprove
                    ? "Add any notes or conditions for this approval"
                    : "Give a clear reason for rejecting this leave request"
                }
                rows={5}
                required
                error={Boolean(decisionError)}
              />
            </Field>
          </VStack>
        </Modal>
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <Modal
          title={
            <HStack inline gap="small" align="center" color="info-text">
              <LogIn size={20} />
              Join leave request
            </HStack>
          }
          onClose={() => setShowJoinModal(false)}
          width={600}
          footer={
            <>
              <Button type="button" onClick={() => setShowJoinModal(false)} variant="secondary" size="md">
                Cancel
              </Button>
              <Button
                type="button"
                onClick={submitJoinLeave}
                variant="info"
                size="md"
                disabled={joinLoading}
                loading={joinLoading}
              >
                Confirm join
              </Button>
            </>
          }
        >
          <VStack gap="large">
            {joinError && <Alert type="error">{joinError}</Alert>}

            <DetailSection title="Leave you are joining" tone="info">
              <InfoRow label="Dates" value={dateRange} />
              <InfoRow label="Duration" value={`${durationDays} day(s)`} strong />
              <InfoRow label="Status" value={<Badge variant="success" size="small">Approved</Badge>} />
            </DetailSection>

            <Field
              label="Join information"
              required
              help="This information is recorded with your leave request and may be used for administrative purposes."
            >
              <Textarea
                value={joinInfo}
                onChange={(e) => setJoinInfo(e.target.value)}
                placeholder="Describe how you are joining this leave — actual dates, location, any other detail"
                rows={5}
                required
                error={Boolean(joinError)}
              />
            </Field>
          </VStack>
        </Modal>
      )}
    </>
  )
}

export default LeaveDetailModal
