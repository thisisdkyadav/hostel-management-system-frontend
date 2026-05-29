import { useEffect, useMemo, useState } from "react"
import { ShieldCheck } from "lucide-react"
import toast from "react-hot-toast"
import { DataTable } from "czero/react"
import PorRequestDetailModal from "@/components/por/PorRequestDetailModal"
import { Badge, EmptyState } from "@/components/ui"
import { porApi } from "@/service"

const STATUS_META = {
  pending_gymkhana: { label: "Pending Gymkhana", variant: "warning" },
  pending_club: { label: "Pending Club", variant: "warning" },
  pending_gs: { label: "Pending GS", variant: "warning" },
  pending_president: { label: "Pending President", variant: "warning" },
  pending_student_affairs: { label: "Pending Student Affairs", variant: "warning" },
  pending_officer: { label: "Pending Officer", variant: "warning" },
  pending_associate_dean: { label: "Pending Associate Dean", variant: "warning" },
  pending_dean: { label: "Pending Dean", variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  rejected: { label: "Rejected", variant: "danger" },
  revision_requested: { label: "Modification Requested", variant: "info" },
}

const POST_SA_STAGE_ORDER = [
  "Officer SA",
  "Associate Dean SA",
  "Dean SA",
]

const formatStatusLabel = (status) => STATUS_META[status]?.label || status || "Unknown"
const getStatusVariant = (status) => STATUS_META[status]?.variant || "default"

const formatStageLabel = (stage) => {
  if (stage === "Student Affairs") return "Office - Student Affairs"
  return stage || "Completed"
}

const formatDateTime = (value) => {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString()
}

const PorTab = ({ userId }) => {
  const [workspace, setWorkspace] = useState({
    viewer: null,
    requests: [],
    approversByStage: {},
  })
  const [loading, setLoading] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [reviewComment, setReviewComment] = useState("")
  const [postSaAssignments, setPostSaAssignments] = useState({})
  const [actionLoading, setActionLoading] = useState("")

  const loadRequests = async () => {
    if (!userId) return

    try {
      setLoading(true)
      const response = await porApi.getStudentRequests(userId)
      setWorkspace({
        viewer: response?.viewer || null,
        requests: Array.isArray(response?.requests) ? response.requests : [],
        approversByStage: response?.approversByStage || {},
      })
    } catch (error) {
      console.error("Error fetching student POR requests:", error)
      setWorkspace({
        viewer: null,
        requests: [],
        approversByStage: {},
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [userId])

  useEffect(() => {
    if (!selectedRequest) {
      setReviewComment("")
      setPostSaAssignments({})
      return
    }

    setReviewComment(selectedRequest?.rejectionReason || "")
    setPostSaAssignments({})
  }, [selectedRequest])

  const tableRows = useMemo(
    () => (Array.isArray(workspace.requests) ? workspace.requests : []),
    [workspace.requests]
  )

  const handleAssignPostSaApprover = (stage, userIdValue) => {
    setPostSaAssignments((current) => ({
      ...current,
      [stage]: userIdValue,
    }))
  }

  const handleApprove = async (directApprove = false) => {
    if (!selectedRequest?.id) return

    try {
      setActionLoading(directApprove ? "direct-approve" : "approve")
      const nextApprovers = POST_SA_STAGE_ORDER
        .map((stage) => ({
          stage,
          userId: String(postSaAssignments?.[stage] || "").trim(),
        }))
        .filter((entry) => entry.userId)

      const nextApprovalStages = nextApprovers.map((entry) => entry.stage)

      await porApi.approve(selectedRequest.id, {
        comments: reviewComment,
        nextApprovalStages,
        nextApprovers,
        directApprove,
      })

      toast.success(
        directApprove || selectedRequest?.currentApprovalStage === "Dean SA"
          ? "POR request approved"
          : "POR request recommended"
      )
      setSelectedRequest(null)
      await loadRequests()
    } catch (error) {
      toast.error(error?.message || "Failed to update POR request")
    } finally {
      setActionLoading("")
    }
  }

  const handleReject = async () => {
    if (!selectedRequest?.id) return

    try {
      setActionLoading("reject")
      await porApi.reject(selectedRequest.id, reviewComment)
      toast.success("POR request rejected")
      setSelectedRequest(null)
      await loadRequests()
    } catch (error) {
      toast.error(error?.message || "Failed to reject POR request")
    } finally {
      setActionLoading("")
    }
  }

  const handleRequestRevision = async () => {
    if (!selectedRequest?.id) return

    try {
      setActionLoading("revision")
      await porApi.requestRevision(selectedRequest.id, reviewComment)
      toast.success("Modification requested")
      setSelectedRequest(null)
      await loadRequests()
    } catch (error) {
      toast.error(error?.message || "Failed to request modification")
    } finally {
      setActionLoading("")
    }
  }

  const columns = useMemo(
    () => [
      {
        header: "Position",
        key: "positionTitle",
        render: (request) => (
          <div style={{ display: "grid", gap: "4px", minWidth: 0 }}>
            <span style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)" }}>
              {request.positionTitle || "—"}
            </span>
            <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
              {request.tenure || "—"}
            </span>
          </div>
        ),
      },
      {
        header: "Category",
        key: "porCategoryName",
        render: (request) => (
          <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
            {request.porCategoryName || "—"}
          </span>
        ),
      },
      {
        header: "Status",
        key: "status",
        render: (request) => (
          <Badge variant={getStatusVariant(request.status)}>{formatStatusLabel(request.status)}</Badge>
        ),
      },
      {
        header: "Current Stage",
        key: "currentApprovalStage",
        render: (request) => (
          <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
            {formatStageLabel(request.currentApprovalStage)}
          </span>
        ),
      },
      {
        header: "Updated",
        key: "updatedAt",
        render: (request) => (
          <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
            {formatDateTime(request.updatedAt || request.createdAt)}
          </span>
        ),
      },
    ],
    []
  )

  return (
    <div style={{ backgroundColor: "var(--color-bg-primary)" }}>
      {tableRows.length > 0 || loading ? (
        <DataTable
          columns={columns}
          data={tableRows}
          loading={loading}
          emptyMessage="No POR requests found for this student."
          onRowClick={setSelectedRequest}
        />
      ) : (
        <EmptyState
          icon={ShieldCheck}
          title="No POR Requests"
          message="This student has not submitted any Position of Responsibility requests yet."
        />
      )}

      <PorRequestDetailModal
        isOpen={Boolean(selectedRequest)}
        request={selectedRequest}
        viewer={workspace.viewer}
        approversByStage={workspace.approversByStage}
        reviewComment={reviewComment}
        onReviewCommentChange={setReviewComment}
        postSaAssignments={postSaAssignments}
        onPostSaAssignmentChange={handleAssignPostSaApprover}
        onClose={() => setSelectedRequest(null)}
        onApprove={() => handleApprove(false)}
        onDirectApprove={() => handleApprove(true)}
        onReject={handleReject}
        onRequestRevision={handleRequestRevision}
        onEdit={undefined}
        actionLoading={actionLoading}
        canViewStudentProfile={false}
      />
    </div>
  )
}

export default PorTab
