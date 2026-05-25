import { useEffect, useMemo, useState } from "react"
import { Button, DataTable, Input, Modal, Tabs } from "czero/react"
import { BadgeCheck, Building2, CalendarDays, Clock3, FilePenLine, FileText, Plus, Settings2, ShieldAlert, ShieldCheck, Trash2, UserRoundSearch, Users } from "lucide-react"
import toast from "react-hot-toast"
import PageHeader from "../../components/common/PageHeader"
import StudentDetailModal from "../../components/common/students/StudentDetailModal"
import PdfUploadField from "../../components/common/pdf/PdfUploadField"
import PorApprovalHistory from "../../components/por/PorApprovalHistory"
import { Badge, Checkbox, EmptyState, ErrorState, Label, LoadingState, Select, Textarea } from "@/components/ui"
import { porApi, studentApi, uploadApi } from "@/service"
import {
  EventDetailInfoRow,
  EventDetailSectionCard,
  SectionHeader,
  eventDetailMetaChipStyles,
  infoBoxStyle,
  sectionLabelStyle,
} from "@/components/gymkhana/events-page/sharedPrimitives"

const createDefaultForm = () => ({
  porCategoryId: "",
  hasDisciplinaryAction: false,
  disciplinaryActionDetails: "",
  positionTitle: "",
  positionDetails: "",
  tenure: "",
  supportingDocumentUrl: "",
  supportingDocumentName: "",
  undertakingAccepted: false,
})

const POST_SA_STAGE_ORDER = [
  "Officer SA",
  "Associate Dean SA",
  "Dean SA",
]

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

const detailBodyStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--spacing-4)",
}

const detailTextStyle = {
  color: "var(--color-text-body)",
  fontSize: "var(--font-size-sm)",
  lineHeight: 1.6,
  whiteSpace: "pre-wrap",
}

const metaBarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--spacing-3)",
  flexWrap: "wrap",
  paddingBottom: "var(--spacing-3)",
  borderBottom: "1px solid var(--color-border-primary)",
}

const metaBarLeftStyle = {
  display: "flex",
  alignItems: "center",
  gap: "var(--spacing-2)",
  flexWrap: "wrap",
}

const buildMetaChipStyle = (extra = {}) => ({
  ...eventDetailMetaChipStyles,
  ...extra,
})

const isPendingStatus = (status) => String(status || "").startsWith("pending_")

const getStatusTabLabel = (status) => {
  if (status === "all") return "All"
  if (status === "action_required") return "Action Required"
  if (status === "pending") return "Pending"
  return formatStatusLabel(status)
}

const buildStatusTabs = (requests = []) => {
  const countByStatus = requests.reduce((acc, request) => {
    const status = String(request?.status || "")
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  const actionRequiredCount = requests.filter((request) => request?.isActionRequired).length
  const pendingCount = requests.filter((request) => isPendingStatus(request?.status)).length

  const tabOrder = [
    "all",
    "action_required",
    "pending",
    "revision_requested",
    "approved",
    "rejected",
  ]

  return tabOrder.map((status) => {
    const count =
      status === "all"
        ? requests.length
        : status === "action_required"
          ? actionRequiredCount
          : status === "pending"
            ? pendingCount
            : countByStatus[status] || 0

    return {
      value: status,
      label: `${getStatusTabLabel(status)} (${count})`,
    }
  })
}

const getViewerTitle = (mode) => {
  if (mode === "student") return "POR Requests"
  if (mode === "club") return "Club POR Requests"
  if (mode === "gs") return "GS POR Requests"
  if (mode === "president") return "President POR Requests"
  if (mode === "gymkhana") return "Gymkhana POR Requests"
  return "POR Verification"
}

const getViewerSubtitle = (mode) => {
  if (mode === "student") {
    return "Apply for Position of Responsibility verification, track its status, and respond to modification requests."
  }

  if (mode === "club") {
    return "Review POR requests assigned to your club account and move them through the Gymkhana workflow."
  }

  if (mode === "gs") {
    return "Review POR requests assigned to your Gymkhana role."
  }

  if (mode === "president") {
    return "Review POR requests before they move to Office - Student Affairs."
  }

  if (mode === "gymkhana") {
    return "Review POR requests assigned to you in the configured Gymkhana reviewer chain."
  }

  return "Review POR requests, manage POR categories, monitor the approval chain, and assign post-Student-Affairs recommenders where required."
}

const shouldShowStudentColumn = (viewer) => viewer?.mode !== "student"

const shouldShowCategoryColumn = (viewer) => viewer?.mode !== "student"

const buildPorCategoryOptions = (porCategories = []) =>
  (Array.isArray(porCategories) ? porCategories : []).map((category) => ({
    value: category.id,
    label: category.name || "POR Category",
  }))

const isGroupedReviewEligible = (request, viewer) =>
  viewer?.mode !== "student" &&
  Boolean(request?.permissions?.canApprove) &&
  isPendingStatus(request?.status) &&
  Boolean(request?.student?.id || request?.student?._id || request?.student?.rollNumber || request?.student?.email) &&
  Boolean(request?.currentApprovalStage)

const buildGroupedReviewKey = (request) => {
  const studentKey =
    request?.student?.id ||
    request?.student?._id ||
    request?.student?.rollNumber ||
    request?.student?.email ||
    request?.student?.name ||
    "student"

  return [
    studentKey,
    request?.currentApprovalStage || "",
    request?.status || "",
  ].join("::")
}

const buildGroupSummary = (requests = []) => {
  const clubs = Array.from(new Set(requests.map((request) => request?.club?.name).filter(Boolean)))
  const positions = Array.from(new Set(requests.map((request) => request?.positionTitle).filter(Boolean)))
  const categories = Array.from(new Set(requests.map((request) => request?.porCategoryName).filter(Boolean)))
  const latestUpdatedAt = requests
    .map((request) => request?.updatedAt || request?.createdAt || null)
    .filter(Boolean)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] || null

  return {
    clubs,
    positions,
    categories,
    latestUpdatedAt,
  }
}

const buildTableRows = (requests = [], viewer = {}) => {
  if (viewer?.mode === "student") {
    return requests.map((request) => ({
      rowType: "single",
      id: request.id,
      request,
    }))
  }

  const grouped = new Map()
  const tableRows = []

  requests.forEach((request) => {
    if (!isGroupedReviewEligible(request, viewer)) {
      tableRows.push({
        rowType: "single",
        id: request.id,
        request,
      })
      return
    }

    const key = buildGroupedReviewKey(request)
    if (!grouped.has(key)) {
      grouped.set(key, [])
    }
    grouped.get(key).push(request)
  })

  grouped.forEach((groupRequests, key) => {
    if (groupRequests.length === 1) {
      tableRows.push({
        rowType: "single",
        id: groupRequests[0].id,
        request: groupRequests[0],
      })
      return
    }

    const primaryRequest = groupRequests[0]
    const summary = buildGroupSummary(groupRequests)

    tableRows.push({
      rowType: "group",
      id: `group:${key}`,
      requests: groupRequests,
      student: primaryRequest.student,
      status: primaryRequest.status,
      currentApprovalStage: primaryRequest.currentApprovalStage,
      isActionRequired: groupRequests.some((request) => request?.isActionRequired),
      gymkhanaCategoryLabel:
        summary.categories.length === 1
          ? summary.categories[0]
          : summary.categories.length > 1
            ? `Multiple (${summary.categories.length})`
            : "—",
      updatedAt: summary.latestUpdatedAt,
      clubs: summary.clubs,
      positions: summary.positions,
      requestCount: groupRequests.length,
      primaryRequest,
    })
  })

  return tableRows.sort((a, b) => {
    const aDate = new Date(a.rowType === "group" ? a.updatedAt : a.request?.updatedAt || a.request?.createdAt || 0).getTime()
    const bDate = new Date(b.rowType === "group" ? b.updatedAt : b.request?.updatedAt || b.request?.createdAt || 0).getTime()
    return bDate - aDate
  })
}

const buildGroupedRequestCommentState = (requests = []) =>
  requests.reduce((acc, request) => {
    acc[request.id] = request?.rejectionReason || ""
    return acc
  }, {})

const getFilenameFromUrl = (url, fallback = "document.pdf") => {
  const normalized = String(url || "").trim()
  if (!normalized) return fallback
  if (normalized.startsWith("media://")) return fallback

  try {
    const parsed = new URL(normalized)
    const candidate = decodeURIComponent(parsed.pathname.split("/").pop() || "")
    return candidate || fallback
  } catch {
    const candidate = decodeURIComponent(normalized.split("/").pop()?.split("?")[0] || "")
    return candidate || fallback
  }
}

const createEmptyCategoryStep = (index = 0) => ({
  label: `Gymkhana Step ${index + 1}`,
  reviewerUserIds: [],
  reviewerPickerId: "",
})

const createDefaultCategoryForm = () => ({
  name: "",
  gymkhanaSteps: [createEmptyCategoryStep(0)],
})

const countSelectedPostSaApprovers = (assignments = {}) =>
  POST_SA_STAGE_ORDER.reduce(
    (count, stage) => (String(assignments?.[stage] || "").trim() ? count + 1 : count),
    0
  )

const formatCurrentReviewerLabel = (request) => {
  const reviewerUsers = Array.isArray(request?.currentApproverUsers) ? request.currentApproverUsers : []
  if (reviewerUsers.length === 0) {
    return request?.currentApproverUser?.name || "Unassigned"
  }

  if (reviewerUsers.length === 1) {
    return reviewerUsers[0]?.name || "Assigned reviewer"
  }

  return `${reviewerUsers[0]?.name || "Assigned reviewer"} +${reviewerUsers.length - 1}`
}

const PorRequestFormModal = ({
  isOpen,
  isSaving,
  porCategories,
  formData,
  onChange,
  onClose,
  onSubmit,
  isEdit = false,
}) => {
  if (!isOpen) return null

  const categoryOptions = buildPorCategoryOptions(porCategories)
  const updateSupportingDocument = (url, name = "") => {
    onChange?.({
      target: {
        name: "supportingDocumentUrl",
        value: url,
      },
    })
    onChange?.({
      target: {
        name: "supportingDocumentName",
        value: url ? name : "",
      },
    })
  }

  const uploadSupportingDocument = (file) => {
    updateSupportingDocument(formData.supportingDocumentUrl, file.name)
    const uploadPayload = new FormData()
    uploadPayload.append("porPdf", file)
    return uploadApi.uploadPorDocumentPDF(uploadPayload)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit & Resubmit POR Request" : "Create POR Request"}
      width={820}
      minHeight="50vh"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit?.()
        }}
        className="flex min-h-[42vh] flex-col justify-between gap-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="por-category" required>POR Category</Label>
            <Select
              id="por-category"
              name="porCategoryId"
              value={formData.porCategoryId}
              onChange={onChange}
              options={categoryOptions}
              placeholder="Select POR category"
              required
              disabled={isSaving}
            />
          </div>

          <div>
            <Label htmlFor="por-position-title" required>Position of Responsibility</Label>
            <Input
              id="por-position-title"
              name="positionTitle"
              value={formData.positionTitle}
              onChange={onChange}
              placeholder="e.g. Treasurer"
              disabled={isSaving}
              required
            />
          </div>

          <div>
            <Label htmlFor="por-tenure" required>Tenure</Label>
            <Input
              id="por-tenure"
              name="tenure"
              value={formData.tenure}
              onChange={onChange}
              placeholder="e.g. Jul 2024 - Apr 2025"
              disabled={isSaving}
              required
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="por-position-details" required>POR Details</Label>
            <Textarea
              id="por-position-details"
              name="positionDetails"
              value={formData.positionDetails}
              onChange={onChange}
              placeholder="Describe the position and your responsibilities"
              rows={5}
              required
              disabled={isSaving}
            />
          </div>

          <div className="md:col-span-2">
            <div style={{ ...infoBoxStyle, marginBottom: "var(--spacing-2)" }}>
              <span style={sectionLabelStyle}>Order of Attachment in PDF</span>
              <ol
                style={{
                  margin: "var(--spacing-2) 0 0",
                  paddingLeft: "var(--spacing-5)",
                  color: "var(--color-text-body)",
                  fontSize: "var(--font-size-sm)",
                  lineHeight: 1.6,
                }}
              >
                <li>Academic Achievements</li>
                <li>Part of any Club/Fluxus/Ingenium/RIC/MUN/E-Summit etc.</li>
                <li>Participation in any Inter IIT Meets</li>
                <li>Any other extra-curricular activities</li>
              </ol>
            </div>
            <PdfUploadField
              label="Supporting PDF"
              value={formData.supportingDocumentUrl}
              onChange={(url) =>
                updateSupportingDocument(
                  url,
                  url ? formData.supportingDocumentName || getFilenameFromUrl(url, "por-document.pdf") : ""
                )
              }
              onUpload={uploadSupportingDocument}
              disabled={isSaving}
              required
              uploadedText={formData.supportingDocumentName || "Supporting PDF uploaded"}
              viewerTitle="POR Supporting Document"
              viewerSubtitle="Uploaded supporting PDF"
              downloadFileName={formData.supportingDocumentName || "por-document.pdf"}
            />
          </div>

          <div className="md:col-span-2">
            <Checkbox
              id="por-disciplinary-flag"
              name="hasDisciplinaryAction"
              checked={formData.hasDisciplinaryAction}
              onChange={(event) =>
                onChange?.({
                  target: {
                    name: "hasDisciplinaryAction",
                    value: event?.target?.checked,
                    checked: event?.target?.checked,
                    type: "checkbox",
                  },
                })
              }
              label="I have a disciplinary action that should be disclosed with this request"
            />
          </div>

          {formData.hasDisciplinaryAction ? (
            <div className="md:col-span-2">
              <Label htmlFor="por-disciplinary-details" required>
                Disciplinary Action Details
              </Label>
              <Textarea
                id="por-disciplinary-details"
                name="disciplinaryActionDetails"
                value={formData.disciplinaryActionDetails}
                onChange={onChange}
                placeholder="Briefly describe the disciplinary action"
                rows={4}
                required
                disabled={isSaving}
              />
            </div>
          ) : null}

          <div className="md:col-span-2">
            <Checkbox
              id="por-undertaking-accepted"
              name="undertakingAccepted"
              checked={Boolean(formData.undertakingAccepted)}
              onChange={(event) =>
                onChange?.({
                  target: {
                    name: "undertakingAccepted",
                    value: event?.target?.checked,
                    checked: event?.target?.checked,
                    type: "checkbox",
                  },
                })
              }
              label="I hereby declare that the information provided by me is true and correct to the best of my knowledge and belief. If any of the information is found to be false or misleading, I authorize the Institute to take appropriate action against me as deemed fit."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" loading={isSaving} disabled={isSaving || categoryOptions.length === 0}>
            {isEdit ? "Resubmit Request" : "Create Request"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

const PorCategoryFormModal = ({
  isOpen,
  isSaving,
  formData,
  reviewerOptions,
  onChangeName,
  onChangeStepLabel,
  onSelectReviewer,
  onAddReviewer,
  onRemoveReviewer,
  onAddStep,
  onRemoveStep,
  onClose,
  onSubmit,
  isEdit = false,
}) => {
  if (!isOpen) return null

  const reviewerOptionMap = new Map(
    (Array.isArray(reviewerOptions) ? reviewerOptions : []).map((option) => [option.id, option])
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit POR Category" : "Create POR Category"}
      width={980}
      minHeight="50vh"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit?.()
        }}
        className="flex min-h-[42vh] flex-col justify-between gap-6"
      >
        <div className="space-y-5">
          <div>
            <Label htmlFor="por-category-name" required>Category Name</Label>
            <Input
              id="por-category-name"
              value={formData.name}
              onChange={(event) => onChangeName?.(event.target.value)}
              placeholder="e.g. Technical Council"
              disabled={isSaving}
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div
                  style={{
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-semibold)",
                    color: "var(--color-text-heading)",
                  }}
                >
                  Gymkhana Review Steps
                </div>
                <div
                  style={{
                    marginTop: "4px",
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  Add one or more Gymkhana stages that should recommend the POR before Office - Student Affairs.
                </div>
              </div>

              <Button type="button" variant="secondary" onClick={onAddStep} disabled={isSaving}>
                <Plus size={16} />
                Add Step
              </Button>
            </div>

            <div className="space-y-4">
              {(Array.isArray(formData.gymkhanaSteps) ? formData.gymkhanaSteps : []).map((step, stepIndex) => {
                const selectedReviewerIds = Array.isArray(step.reviewerUserIds) ? step.reviewerUserIds : []
                const selectedReviewers = selectedReviewerIds
                  .map((reviewerId) => reviewerOptionMap.get(reviewerId))
                  .filter(Boolean)
                const availableReviewerOptions = (Array.isArray(reviewerOptions) ? reviewerOptions : [])
                  .filter((option) => !selectedReviewerIds.includes(option.id))
                  .map((option) => ({
                    value: option.id,
                    label: option.label,
                  }))

                return (
                  <div
                    key={`por-category-step-${stepIndex}`}
                    style={{
                      border: "1px solid var(--color-border-primary)",
                      borderRadius: "var(--radius-card-sm)",
                      backgroundColor: "var(--color-bg-secondary)",
                      padding: "var(--spacing-4)",
                    }}
                  >
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor={`por-category-step-label-${stepIndex}`} required>
                            Step {stepIndex + 1} Label
                          </Label>
                          <Input
                            id={`por-category-step-label-${stepIndex}`}
                            value={step.label}
                            onChange={(event) => onChangeStepLabel?.(stepIndex, event.target.value)}
                            placeholder={`Gymkhana Step ${stepIndex + 1}`}
                            disabled={isSaving}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                          <div>
                            <Label htmlFor={`por-category-step-reviewer-${stepIndex}`}>
                              Add Gymkhana Reviewer
                            </Label>
                            <Select
                              id={`por-category-step-reviewer-${stepIndex}`}
                              value={step.reviewerPickerId || ""}
                              onChange={(event) => onSelectReviewer?.(stepIndex, event.target.value)}
                              options={availableReviewerOptions}
                              placeholder="Select reviewer"
                              disabled={isSaving}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => onAddReviewer?.(stepIndex)}
                            disabled={isSaving || !step.reviewerPickerId}
                          >
                            Add Reviewer
                          </Button>
                        </div>

                        <div style={infoBoxStyle}>
                          <span style={sectionLabelStyle}>Assigned Reviewers</span>
                          {selectedReviewers.length > 0 ? (
                            <div className="mt-3 space-y-2">
                              {selectedReviewers.map((reviewer) => (
                                <div
                                  key={`${reviewer.id}-${stepIndex}`}
                                  className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] px-3 py-2"
                                >
                                  <div className="min-w-0">
                                    <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                                      {reviewer.name}
                                    </div>
                                    <div className="truncate text-xs text-[var(--color-text-muted)]">
                                      {reviewer.email}
                                    </div>
                                    <div className="mt-1 text-[11px] text-[var(--color-text-placeholder)]">
                                      {reviewer.subRole || reviewer.role}
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onRemoveReviewer?.(stepIndex, reviewer.id)}
                                    disabled={isSaving}
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="mt-2 text-sm text-[var(--color-text-muted)]">
                              Select at least one Gymkhana user for this step.
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveStep?.(stepIndex)}
                          disabled={isSaving || (formData.gymkhanaSteps?.length || 0) <= 1}
                        >
                          <Trash2 size={14} />
                          Remove Step
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="button" onClick={() => onSubmit?.()} loading={isSaving} disabled={isSaving}>
            {isEdit ? "Save Category" : "Create Category"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

const PorCategoryManagementModal = ({
  isOpen,
  categories,
  onClose,
  onAdd,
  onEdit,
}) => {
  if (!isOpen) return null

  const categoryRows = Array.isArray(categories) ? categories : []
  const categoryColumns = [
    {
      header: "Category",
      key: "name",
      render: (category) => (
        <div style={{ display: "grid", gap: "4px" }}>
          <div style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }}>
            {category.name || "—"}
          </div>
          <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
            {(category.gymkhanaSteps?.length || category.stepCount || 0)} Gymkhana step
            {(category.gymkhanaSteps?.length || category.stepCount || 0) === 1 ? "" : "s"}
          </div>
        </div>
      ),
    },
    {
      header: "Review Flow",
      key: "steps",
      render: (category) => (
        <div style={{ display: "grid", gap: "4px" }}>
          {(Array.isArray(category.gymkhanaSteps) ? category.gymkhanaSteps : []).map((step, index) => (
            <div
              key={`${category.id}-table-step-${index}`}
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-muted)",
              }}
            >
              {index + 1}. {step.label || "Step"}
            </div>
          ))}
        </div>
      ),
    },
    {
      header: "Reviewers",
      key: "reviewers",
      render: (category) => {
        const reviewerCount = (Array.isArray(category.gymkhanaSteps) ? category.gymkhanaSteps : []).reduce(
          (count, step) => count + (Array.isArray(step.reviewers) ? step.reviewers.length : Array.isArray(step.reviewerUserIds) ? step.reviewerUserIds.length : 0),
          0
        )

        return reviewerCount || "—"
      },
    },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage POR Categories"
      width={1080}
      minHeight="50vh"
    >
      <div className="flex min-h-[42vh] flex-col gap-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-sm text-[var(--color-text-muted)]">
              Create categories and define the ordered Gymkhana review flow before Office - Student Affairs.
            </div>
          </div>
          <div className="flex justify-start lg:justify-end">
            <Button onClick={onAdd}>
              <Plus size={16} />
              Add Category
            </Button>
          </div>
        </div>
        {categoryRows.length > 0 ? (
          <DataTable
            columns={categoryColumns}
            data={categoryRows}
            loading={false}
            emptyMessage="No POR categories added yet."
            onRowClick={onEdit}
          />
        ) : (
          <EmptyState
            icon={Building2}
            title="No POR Categories Yet"
            message="Create the first POR category to define how Gymkhana recommendations should flow before Student Affairs."
          />
        )}
      </div>
    </Modal>
  )
}

const PorRequestDetailModal = ({
  isOpen,
  request,
  viewer,
  approversByStage,
  reviewComment,
  onReviewCommentChange,
  postSaAssignments,
  onPostSaAssignmentChange,
  onClose,
  onApprove,
  onDirectApprove,
  onReject,
  onRequestRevision,
  onEdit,
  actionLoading,
}) => {
  const [showFullHistoryModal, setShowFullHistoryModal] = useState(false)
  const [studentId, setStudentId] = useState(null)
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false)
  const canAct = Boolean(request?.permissions?.canApprove)
  const canViewStudentProfile = Boolean(request?.student?.userId && viewer?.mode !== "student")
  const isStudentAffairsApproval =
    viewer?.canSelectPostApprovers && request?.status === "pending_student_affairs"
  const primaryDecisionLabel = request?.currentApprovalStage === "Dean SA" ? "Approve" : "Recommend"
  const selectedPostSaApproverCount = countSelectedPostSaApprovers(postSaAssignments)

  useEffect(() => {
    let isSubscribed = true

    const loadStudentId = async () => {
      if (!isOpen || !canViewStudentProfile) {
        if (isSubscribed) {
          setStudentId(null)
          setShowStudentDetailModal(false)
        }
        return
      }

      try {
        const resolvedStudentId = await studentApi.getStudentId(request.student.userId)
        if (!isSubscribed) return
        setStudentId(resolvedStudentId || null)
      } catch (error) {
        console.error("Failed to resolve POR student profile id:", error)
        if (!isSubscribed) return
        setStudentId(null)
      }
    }

    loadStudentId()

    return () => {
      isSubscribed = false
    }
  }, [canViewStudentProfile, isOpen, request?.student?.userId])

  const handleOpenStudentDetail = () => {
    if (!canViewStudentProfile || !studentId) return
    setShowStudentDetailModal(true)
  }

  if (!isOpen || !request) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="POR Request Details"
      width={1080}
      minHeight="50vh"
      closeButtonVariant="button"
    >
      <div style={detailBodyStyle}>
        <div style={metaBarStyle}>
          <div style={metaBarLeftStyle}>
            <span
              style={buildMetaChipStyle({
                fontFamily: "monospace",
                backgroundColor: "var(--color-bg-muted)",
              })}
            >
              {request.id}
            </span>
            <Badge variant={getStatusVariant(request.status)}>{formatStatusLabel(request.status)}</Badge>
            <span style={buildMetaChipStyle()}>{request.porCategoryName || "—"}</span>
            <span style={buildMetaChipStyle()}>
              <ShieldCheck size={12} />
              {formatStageLabel(request.currentApprovalStage)}
            </span>
            <span style={buildMetaChipStyle()}>
              <CalendarDays size={12} />
              Submitted {formatDateTime(request.createdAt)}
            </span>
          </div>

          <div style={{ display: "flex", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
            {request?.permissions?.canEdit ? (
              <Button variant="secondary" size="sm" onClick={onEdit}>
                Edit & Resubmit
              </Button>
            ) : null}
          </div>
        </div>

        <div
          className="grid grid-cols-1 xl:grid-cols-3"
          style={{ gap: "var(--spacing-4)", alignItems: "start" }}
        >
          <div
            className="xl:col-span-2"
            style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}
          >
            <EventDetailSectionCard
              icon={FileText}
              title="POR Submission"
              accentColor="var(--color-primary)"
            >
              <div style={{ display: "grid", gap: "var(--spacing-3)" }}>
                <div style={infoBoxStyle}>
                  <span style={sectionLabelStyle}>Position of Responsibility</span>
                  <div
                    style={{
                      marginTop: "var(--spacing-2)",
                      fontSize: "var(--font-size-base)",
                      fontWeight: "var(--font-weight-semibold)",
                      color: "var(--color-text-heading)",
                    }}
                  >
                    {request.positionTitle || "—"}
                  </div>
                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "var(--font-size-sm)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    Tenure: {request.tenure || "—"}
                  </div>
                </div>

                <SectionHeader>Responsibilities</SectionHeader>
                <div style={detailTextStyle}>{request.positionDetails || "—"}</div>

                <SectionHeader>Supporting Document</SectionHeader>
                {request.supportingDocumentUrl ? (
                  <PdfUploadField
                    label="Supporting PDF"
                    value={request.supportingDocumentUrl}
                    onChange={() => {}}
                    disabled
                    uploadedText={request.supportingDocumentName || "Supporting PDF uploaded"}
                    viewerTitle="POR Supporting Document"
                    viewerSubtitle="Uploaded supporting PDF"
                    downloadFileName={request.supportingDocumentName || "por-document.pdf"}
                  />
                ) : (
                  <div style={infoBoxStyle}>
                    <span style={sectionLabelStyle}>Attachment</span>
                    <div style={{ marginTop: "var(--spacing-2)", ...detailTextStyle }}>
                      No supporting PDF attached.
                    </div>
                  </div>
                )}
              </div>
            </EventDetailSectionCard>

            <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: "var(--spacing-4)" }}>
              <EventDetailSectionCard
                icon={Users}
                title="Student Details"
                accentColor="var(--color-info)"
                headerAction={
                  canViewStudentProfile ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleOpenStudentDetail}
                      disabled={!studentId}
                    >
                      View Profile
                    </Button>
                  ) : null
                }
              >
                <div style={{ display: "grid", gap: "var(--spacing-1)" }}>
                  <EventDetailInfoRow label="Name" value={request.student.name || "—"} />
                  <EventDetailInfoRow label="Roll Number" value={request.student.rollNumber || "—"} />
                  <EventDetailInfoRow label="Email" value={request.student.email || "—"} />
                  <EventDetailInfoRow label="Department" value={request.student.department || "—"} />
                  <EventDetailInfoRow label="Degree" value={request.student.degree || "—"} />
                  <EventDetailInfoRow label="Batch" value={request.student.batch || "—"} />
                </div>
              </EventDetailSectionCard>

              <EventDetailSectionCard
                icon={Building2}
                title="Routing Details"
                accentColor="var(--color-success)"
              >
                <div style={{ display: "grid", gap: "var(--spacing-1)" }}>
                  <EventDetailInfoRow label="POR Category" value={request.porCategoryName || "—"} />
                  <EventDetailInfoRow label="Club" value={request.club?.name || "—"} />
                  <EventDetailInfoRow
                    label="Current Stage"
                    value={formatStageLabel(request.currentApprovalStage)}
                  />
                  <EventDetailInfoRow
                    label="Current Reviewer"
                    value={formatCurrentReviewerLabel(request)}
                  />
                  <EventDetailInfoRow
                    label="Last Updated"
                    value={formatDateTime(request.updatedAt)}
                  />
                </div>
              </EventDetailSectionCard>
            </div>

            <EventDetailSectionCard
              icon={ShieldCheck}
              title="Disciplinary Disclosure"
              accentColor={request.hasDisciplinaryAction ? "var(--color-warning)" : "var(--color-success)"}
            >
              <div style={{ display: "grid", gap: "var(--spacing-3)" }}>
                <div style={infoBoxStyle}>
                  <span style={sectionLabelStyle}>Declaration</span>
                  <div
                    style={{
                      marginTop: "var(--spacing-2)",
                      fontSize: "var(--font-size-sm)",
                      fontWeight: "var(--font-weight-medium)",
                      color: "var(--color-text-heading)",
                    }}
                  >
                    {request.hasDisciplinaryAction
                      ? "Disciplinary action disclosed by the student"
                      : "No disciplinary action declared"}
                  </div>
                </div>

                {request.hasDisciplinaryAction ? (
                  <div style={detailTextStyle}>
                    {request.disciplinaryActionDetails || "No details provided."}
                  </div>
                ) : null}
              </div>
            </EventDetailSectionCard>

            {canAct ? (
              <EventDetailSectionCard
                icon={BadgeCheck}
                title="Review Decision"
                accentColor="var(--color-primary)"
              >
                <div style={{ display: "grid", gap: "var(--spacing-3)" }}>
                  <div>
                    <Label htmlFor="por-review-comment">
                      {isStudentAffairsApproval ? "Review Comment & Next Recommenders" : "Review Comment"}
                    </Label>
                    <Textarea
                      id="por-review-comment"
                      value={reviewComment}
                      onChange={(event) => onReviewCommentChange?.(event.target.value)}
                      rows={5}
                      placeholder="Add comments for approval, modification, or rejection"
                    />
                  </div>

                  {isStudentAffairsApproval ? (
                    <div style={infoBoxStyle}>
                      <span style={sectionLabelStyle}>Next Recommenders</span>
                      <div
                        className="grid grid-cols-1 gap-3"
                        style={{ marginTop: "var(--spacing-2)" }}
                      >
                        {POST_SA_STAGE_ORDER.map((stage) => (
                          <div key={stage}>
                            <Label htmlFor={`por-approver-${stage}`}>{stage}</Label>
                            <Select
                              id={`por-approver-${stage}`}
                              value={postSaAssignments[stage] || ""}
                              onChange={(event) => onPostSaAssignmentChange?.(stage, event.target.value)}
                              options={(approversByStage?.[stage] || []).map((option) => ({
                                value: option.userId || option.value,
                                label: option.label,
                              }))}
                              placeholder="Optional"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap justify-end gap-3">
                    <Button
                      variant="secondary"
                      onClick={onRequestRevision}
                      disabled={actionLoading || !String(reviewComment || "").trim()}
                      loading={actionLoading === "revision"}
                    >
                      Modification Required
                    </Button>
                    <Button
                      variant="danger"
                      onClick={onReject}
                      disabled={actionLoading || !String(reviewComment || "").trim()}
                      loading={actionLoading === "reject"}
                    >
                      Reject
                    </Button>
                    {isStudentAffairsApproval ? (
                      <Button
                        variant="secondary"
                        onClick={onApprove}
                        disabled={actionLoading || selectedPostSaApproverCount === 0}
                        loading={actionLoading === "approve"}
                      >
                        Recommend & Forward
                      </Button>
                    ) : null}
                    <Button
                      onClick={isStudentAffairsApproval ? onDirectApprove : onApprove}
                      disabled={actionLoading || (isStudentAffairsApproval && selectedPostSaApproverCount > 0)}
                      loading={actionLoading === (isStudentAffairsApproval ? "direct-approve" : "approve")}
                    >
                      {isStudentAffairsApproval ? "Approve" : primaryDecisionLabel}
                    </Button>
                  </div>
                </div>
              </EventDetailSectionCard>
            ) : null}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
            <EventDetailSectionCard
              icon={Clock3}
              title="Approval History"
              accentColor="var(--color-text-heading)"
              headerAction={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowFullHistoryModal(true)}
                >
                  More Details
                </Button>
              }
            >
              <PorApprovalHistory porRequestId={request.id} compact />
            </EventDetailSectionCard>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showFullHistoryModal}
        onClose={() => setShowFullHistoryModal(false)}
        title="Approval History Details"
        width={980}
        minHeight="50vh"
        closeButtonVariant="button"
      >
        <PorApprovalHistory porRequestId={request.id} />
      </Modal>

      {showStudentDetailModal && studentId ? (
        <StudentDetailModal
          selectedStudent={{ _id: studentId, userId: request.student.userId }}
          setShowStudentDetail={setShowStudentDetailModal}
          onUpdate={() => setShowStudentDetailModal(false)}
        />
      ) : null}
    </Modal>
  )
}

const PorRequestGroupModal = ({
  isOpen,
  group,
  viewer,
  approversByStage,
  useCommonComment,
  onUseCommonCommentChange,
  commonReviewComment,
  onCommonReviewCommentChange,
  perRequestComments,
  onPerRequestCommentChange,
  postSaAssignments,
  onPostSaAssignmentChange,
  onClose,
  onApprove,
  onDirectApprove,
  onReject,
  onRequestRevision,
  onOpenIndividual,
  actionLoading,
}) => {
  const [studentId, setStudentId] = useState(null)
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false)
  const requests = Array.isArray(group?.requests) ? group.requests : []
  const student = group?.student || {}
  const canViewStudentProfile = Boolean(student?.userId && viewer?.mode !== "student")
  const isStudentAffairsApproval =
    viewer?.canSelectPostApprovers && group?.status === "pending_student_affairs"
  const primaryDecisionLabel = group?.currentApprovalStage === "Dean SA" ? "Approve" : "Recommend"
  const selectedPostSaApproverCount = countSelectedPostSaApprovers(postSaAssignments)
  const commentRequiredForBulkNegativeAction = useCommonComment
    ? Boolean(String(commonReviewComment || "").trim())
    : requests.every((request) => Boolean(String(perRequestComments?.[request.id] || "").trim()))

  useEffect(() => {
    let isSubscribed = true

    const loadStudentId = async () => {
      if (!isOpen || !canViewStudentProfile) {
        if (isSubscribed) {
          setStudentId(null)
          setShowStudentDetailModal(false)
        }
        return
      }

      try {
        const resolvedStudentId = await studentApi.getStudentId(student.userId)
        if (!isSubscribed) return
        setStudentId(resolvedStudentId || null)
      } catch (error) {
        console.error("Failed to resolve grouped POR student profile id:", error)
        if (!isSubscribed) return
        setStudentId(null)
      }
    }

    loadStudentId()

    return () => {
      isSubscribed = false
    }
  }, [canViewStudentProfile, isOpen, student?.userId])

  const handleOpenStudentDetail = () => {
    if (!canViewStudentProfile || !studentId) return
    setShowStudentDetailModal(true)
  }

  if (!isOpen || !group?.requests?.length) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Grouped POR Review"
      width={1180}
      minHeight="60vh"
      closeButtonVariant="button"
    >
      <div style={detailBodyStyle}>
        <div style={metaBarStyle}>
          <div style={metaBarLeftStyle}>
            <span style={buildMetaChipStyle()}>
              <Users size={12} />
              {student?.name || "Student"}
            </span>
            <span style={buildMetaChipStyle()}>{student?.rollNumber || student?.email || "—"}</span>
            <Badge variant={getStatusVariant(group.status)}>{formatStatusLabel(group.status)}</Badge>
            <span style={buildMetaChipStyle()}>
              <ShieldCheck size={12} />
              {formatStageLabel(group.currentApprovalStage)}
            </span>
            <span style={buildMetaChipStyle()}>
              <FileText size={12} />
              {group.requestCount} PORs
            </span>
          </div>
        </div>

        <div
          className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.9fr)]"
          style={{ gap: "var(--spacing-4)", alignItems: "start" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
            <EventDetailSectionCard
              icon={Users}
              title="Student Overview"
              accentColor="var(--color-info)"
              headerAction={
                canViewStudentProfile ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleOpenStudentDetail}
                    disabled={!studentId}
                  >
                    View Profile
                  </Button>
                ) : null
              }
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div style={{ display: "grid", gap: "var(--spacing-1)" }}>
                  <EventDetailInfoRow label="Name" value={student?.name || "—"} />
                  <EventDetailInfoRow label="Roll Number" value={student?.rollNumber || "—"} />
                  <EventDetailInfoRow label="Email" value={student?.email || "—"} />
                </div>
                <div style={{ display: "grid", gap: "var(--spacing-1)" }}>
                  <EventDetailInfoRow label="Department" value={student?.department || "—"} />
                  <EventDetailInfoRow label="Degree" value={student?.degree || "—"} />
                  <EventDetailInfoRow label="Batch" value={student?.batch || "—"} />
                </div>
              </div>
            </EventDetailSectionCard>

            <EventDetailSectionCard
              icon={FileText}
              title="POR Requests"
              accentColor="var(--color-primary)"
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                {requests.map((request, index) => (
                  <div
                    key={request.id}
                    style={{
                      border: "1px solid var(--color-border-primary)",
                      borderRadius: "var(--radius-card-sm)",
                      backgroundColor: "var(--color-bg-secondary)",
                      padding: "var(--spacing-3)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "var(--spacing-2)",
                        flexWrap: "wrap",
                        marginBottom: "var(--spacing-2)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
                        <span
                          style={buildMetaChipStyle({
                            fontFamily: "monospace",
                            backgroundColor: "var(--color-bg-muted)",
                          })}
                        >
                          {request.id}
                        </span>
                        <span style={buildMetaChipStyle()}>{request.porCategoryName || "—"}</span>
                        {request.club?.name ? <span style={buildMetaChipStyle()}>{request.club.name}</span> : null}
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onOpenIndividual?.(request)}
                      >
                        Open Individually
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <div style={{ display: "grid", gap: "var(--spacing-1)" }}>
                        <EventDetailInfoRow label="Position" value={request.positionTitle || "—"} />
                        <EventDetailInfoRow label="Tenure" value={request.tenure || "—"} />
                        <EventDetailInfoRow
                          label="Disciplinary Disclosure"
                          value={request.hasDisciplinaryAction ? "Yes" : "No"}
                        />
                      </div>

                      <div style={{ display: "grid", gap: "var(--spacing-2)" }}>
                        <div style={infoBoxStyle}>
                          <span style={sectionLabelStyle}>Responsibilities</span>
                          <div style={{ marginTop: "var(--spacing-2)", ...detailTextStyle }}>
                            {request.positionDetails || "—"}
                          </div>
                        </div>

                        {request.hasDisciplinaryAction ? (
                          <div style={infoBoxStyle}>
                            <span style={sectionLabelStyle}>Disciplinary Details</span>
                            <div style={{ marginTop: "var(--spacing-2)", ...detailTextStyle }}>
                              {request.disciplinaryActionDetails || "No details provided."}
                            </div>
                          </div>
                        ) : null}

                        {request.supportingDocumentUrl ? (
                          <PdfUploadField
                            label="Supporting PDF"
                            value={request.supportingDocumentUrl}
                            onChange={() => {}}
                            disabled
                            uploadedText={request.supportingDocumentName || "Supporting PDF uploaded"}
                            viewerTitle="POR Supporting Document"
                            viewerSubtitle="Uploaded supporting PDF"
                            downloadFileName={request.supportingDocumentName || "por-document.pdf"}
                          />
                        ) : null}
                      </div>
                    </div>

                    {!useCommonComment ? (
                      <div style={{ marginTop: "var(--spacing-3)" }}>
                        <Label htmlFor={`group-por-comment-${request.id}`}>
                          Comment for POR {index + 1}
                        </Label>
                        <Textarea
                          id={`group-por-comment-${request.id}`}
                          value={perRequestComments?.[request.id] || ""}
                          onChange={(event) => onPerRequestCommentChange?.(request.id, event.target.value)}
                          rows={3}
                          placeholder="Add a separate comment for this POR request"
                        />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </EventDetailSectionCard>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
            <EventDetailSectionCard
              icon={BadgeCheck}
              title="Grouped Review Decision"
              accentColor="var(--color-primary)"
            >
              <div style={{ display: "grid", gap: "var(--spacing-3)" }}>
                <Checkbox
                  id="por-group-common-comment"
                  checked={useCommonComment}
                  onChange={(event) => onUseCommonCommentChange?.(Boolean(event?.target?.checked))}
                  label="Use one common comment for all selected POR requests"
                />

                {useCommonComment ? (
                  <div>
                    <Label htmlFor="por-group-review-comment">
                      {isStudentAffairsApproval ? "Review Comment & Next Recommenders" : "Review Comment"}
                    </Label>
                    <Textarea
                      id="por-group-review-comment"
                      value={commonReviewComment}
                      onChange={(event) => onCommonReviewCommentChange?.(event.target.value)}
                      rows={5}
                      placeholder="Add one comment to apply across all selected POR requests"
                    />
                  </div>
                ) : (
                  <div style={infoBoxStyle}>
                    <span style={sectionLabelStyle}>Per-POR Comments</span>
                    <div
                      style={{
                        marginTop: "var(--spacing-2)",
                        fontSize: "var(--font-size-sm)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      Enter comments inside each POR card on the left when you want different rejection or modification notes.
                    </div>
                  </div>
                )}

                {isStudentAffairsApproval ? (
                  <div style={infoBoxStyle}>
                    <span style={sectionLabelStyle}>Next Recommenders</span>
                    <div className="grid grid-cols-1 gap-3" style={{ marginTop: "var(--spacing-2)" }}>
                      {POST_SA_STAGE_ORDER.map((stage) => (
                        <div key={stage}>
                          <Label htmlFor={`group-por-approver-${stage}`}>{stage}</Label>
                          <Select
                            id={`group-por-approver-${stage}`}
                            value={postSaAssignments[stage] || ""}
                            onChange={(event) => onPostSaAssignmentChange?.(stage, event.target.value)}
                            options={(approversByStage?.[stage] || []).map((option) => ({
                              value: option.userId || option.value,
                              label: option.label,
                            }))}
                            placeholder="Optional"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-wrap justify-end gap-3">
                  <Button
                    variant="secondary"
                    onClick={onRequestRevision}
                    disabled={actionLoading || !commentRequiredForBulkNegativeAction}
                    loading={actionLoading === "revision"}
                  >
                    Modification Required
                  </Button>
                  <Button
                    variant="danger"
                    onClick={onReject}
                    disabled={actionLoading || !commentRequiredForBulkNegativeAction}
                    loading={actionLoading === "reject"}
                  >
                    Reject All
                  </Button>
                  {isStudentAffairsApproval ? (
                    <Button
                      variant="secondary"
                      onClick={onApprove}
                      disabled={actionLoading || selectedPostSaApproverCount === 0}
                      loading={actionLoading === "approve"}
                    >
                      Recommend & Forward All
                    </Button>
                  ) : null}
                  <Button
                    onClick={isStudentAffairsApproval ? onDirectApprove : onApprove}
                    disabled={actionLoading || (isStudentAffairsApproval && selectedPostSaApproverCount > 0)}
                    loading={actionLoading === (isStudentAffairsApproval ? "direct-approve" : "approve")}
                  >
                    {isStudentAffairsApproval ? "Approve All" : `${primaryDecisionLabel} All`}
                  </Button>
                </div>
              </div>
            </EventDetailSectionCard>
          </div>
        </div>
      </div>

      {showStudentDetailModal && studentId ? (
        <StudentDetailModal
          selectedStudent={{ _id: studentId, userId: student.userId }}
          setShowStudentDetail={setShowStudentDetailModal}
          onUpdate={() => setShowStudentDetailModal(false)}
        />
      ) : null}
    </Modal>
  )
}

const PorRequestsPage = () => {
  const [workspace, setWorkspace] = useState({
    viewer: null,
    porCategories: [],
    requests: [],
    stats: [],
    approversByStage: {},
    gymkhanaReviewerOptions: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingRequest, setEditingRequest] = useState(null)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [selectedRequestGroup, setSelectedRequestGroup] = useState(null)
  const [formData, setFormData] = useState(createDefaultForm())
  const [savingForm, setSavingForm] = useState(false)
  const [reviewComment, setReviewComment] = useState("")
  const [groupReviewComment, setGroupReviewComment] = useState("")
  const [useCommonGroupComment, setUseCommonGroupComment] = useState(true)
  const [groupRequestComments, setGroupRequestComments] = useState({})
  const [postSaAssignments, setPostSaAssignments] = useState({})
  const [groupPostSaAssignments, setGroupPostSaAssignments] = useState({})
  const [actionLoading, setActionLoading] = useState("")
  const [groupActionLoading, setGroupActionLoading] = useState("")
  const [showCategoryManagerModal, setShowCategoryManagerModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryForm, setCategoryForm] = useState(createDefaultCategoryForm())
  const [savingCategory, setSavingCategory] = useState(false)

  const fetchWorkspace = async ({ keepLoading = false } = {}) => {
    try {
      if (!keepLoading) {
        setLoading(true)
      }
      setError("")
      const response = await porApi.getWorkspace()
      setWorkspace({
        viewer: response?.viewer || null,
        porCategories: Array.isArray(response?.porCategories) ? response.porCategories : [],
        requests: Array.isArray(response?.requests) ? response.requests : [],
        stats: Array.isArray(response?.stats) ? response.stats : [],
        approversByStage: response?.approversByStage || {},
        gymkhanaReviewerOptions: Array.isArray(response?.gymkhanaReviewerOptions)
          ? response.gymkhanaReviewerOptions
          : [],
      })
    } catch (err) {
      console.error("Failed to load POR workspace:", err)
      setError(err?.message || "Failed to load POR workspace.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkspace()
  }, [])

  const viewer = workspace.viewer || {}
  const requests = workspace.requests || []
  const porCategories = workspace.porCategories || []
  const gymkhanaReviewerOptions = workspace.gymkhanaReviewerOptions || []

  const statusTabs = useMemo(() => buildStatusTabs(requests), [requests])

  const filteredRequests = useMemo(() => {
    const normalizedSearch = String(searchTerm || "").trim().toLowerCase()

    return requests.filter((request) => {
      const matchesTab =
        activeTab === "all"
          ? true
          : activeTab === "action_required"
            ? Boolean(request?.isActionRequired)
            : activeTab === "pending"
              ? isPendingStatus(request?.status)
              : request?.status === activeTab

      if (!matchesTab) return false

      if (!normalizedSearch) return true

      const haystack = [
        request?.student?.name,
        request?.student?.rollNumber,
        request?.student?.email,
        request?.club?.name,
        request?.porCategoryName,
        request?.positionTitle,
        request?.tenure,
        formatStatusLabel(request?.status),
        formatStageLabel(request?.currentApprovalStage),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return haystack.includes(normalizedSearch)
    })
  }, [activeTab, requests, searchTerm])

  const tableRows = useMemo(
    () => buildTableRows(filteredRequests, viewer),
    [filteredRequests, viewer]
  )

  const tableColumns = useMemo(() => {
    const columns = []

    if (shouldShowStudentColumn(viewer)) {
      columns.push({
        header: "Student",
        key: "student",
        render: (row) => {
          const student = row.rowType === "group" ? row.student : row.request?.student
          return (
          <div style={{ display: "grid", gap: "4px" }}>
            <div style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }}>
                {student?.name || "—"}
            </div>
            <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                {student?.rollNumber || "—"}
            </div>
          </div>
          )
        },
      })
    }

    columns.push(
      {
        header: "Category / POR",
        key: "club",
        render: (row) => {
          if (row.rowType === "group") {
            const categories = Array.isArray(row.categories) ? row.categories : []
            const positions = Array.isArray(row.positions) ? row.positions : []
            const clubs = Array.isArray(row.clubs) ? row.clubs : []
            const categoryLabel =
              categories.length === 1
                ? categories[0]
                : categories.length > 1
                  ? `${categories.length} categories`
                  : "Multiple categories"
            const positionsPreview =
              positions.length <= 2
                ? positions.join(", ")
                : `${positions.slice(0, 2).join(", ")} +${positions.length - 2} more`

            return (
              <div style={{ display: "grid", gap: "4px" }}>
                <div style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }}>
                  {row.requestCount} POR requests
                </div>
                <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                  {categoryLabel}
                </div>
                {clubs.length > 0 ? (
                  <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                    {clubs.length === 1 ? clubs[0] : `${clubs.length} clubs`}
                  </div>
                ) : null}
                <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                  {positionsPreview || "Multiple positions"}
                </div>
              </div>
            )
          }

          const request = row.request
          return (
            <div style={{ display: "grid", gap: "4px" }}>
              <div style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }}>
                {request.porCategoryName || "—"}
              </div>
              <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                {request.positionTitle || "—"}
              </div>
              {request.club?.name ? (
                <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                  Club: {request.club.name}
                </div>
              ) : null}
            </div>
          )
        },
      },
      {
        header: "Tenure",
        key: "tenure",
        render: (row) => (row.rowType === "group" ? "Multiple" : row.request?.tenure || "—"),
      }
    )

    if (shouldShowCategoryColumn(viewer)) {
      columns.push({
        header: "Category",
        key: "category",
        render: (row) => {
          if (row.rowType === "group") {
            const categories = Array.isArray(row.categories) ? row.categories : []
            return row.gymkhanaCategoryLabel || categories.join(", ") || "—"
          }

          return row.request?.gymkhanaCategoryLabel || row.request?.porCategoryName || "—"
        },
      })
    }

    columns.push(
      {
        header: "Status",
        key: "status",
        render: (row) => {
          const status = row.rowType === "group" ? row.status : row.request?.status
          const isActionRequired = row.rowType === "group" ? row.isActionRequired : row.request?.isActionRequired

          return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              <Badge variant={getStatusVariant(status)}>{formatStatusLabel(status)}</Badge>
              {isActionRequired ? <Badge variant="warning">Action Required</Badge> : null}
              {row.rowType === "group" ? <Badge variant="info">Grouped</Badge> : null}
          </div>
          )
        },
      },
      {
        header: "Current Stage",
        key: "currentApprovalStage",
        render: (row) =>
          formatStageLabel(row.rowType === "group" ? row.currentApprovalStage : row.request?.currentApprovalStage),
      },
      {
        header: "Updated",
        key: "updatedAt",
        render: (row) =>
          formatDateTime(row.rowType === "group" ? row.updatedAt : row.request?.updatedAt),
      }
    )

    return columns
  }, [viewer])

  const openCreateModal = () => {
    setEditingRequest(null)
    setFormData(createDefaultForm())
    setShowFormModal(true)
  }

  const openEditModal = (request) => {
    setEditingRequest(request)
    setFormData({
      porCategoryId: request?.porCategory?.id || "",
      hasDisciplinaryAction: Boolean(request?.hasDisciplinaryAction),
      disciplinaryActionDetails: request?.disciplinaryActionDetails || "",
      positionTitle: request?.positionTitle || "",
      positionDetails: request?.positionDetails || "",
      tenure: request?.tenure || "",
      supportingDocumentUrl: request?.supportingDocumentUrl || "",
      supportingDocumentName: request?.supportingDocumentName || "",
      undertakingAccepted: Boolean(request?.undertakingAccepted),
    })
    setSelectedRequest(null)
    setSelectedRequestGroup(null)
    setShowFormModal(true)
  }

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target
    setFormData((current) => {
      const nextValue = type === "checkbox" ? checked : value
      const nextState = { ...current, [name]: nextValue }

      if (name === "hasDisciplinaryAction" && !checked) {
        nextState.disciplinaryActionDetails = ""
      }

      return nextState
    })
  }

  const handleSubmitForm = async () => {
    if (!String(formData.supportingDocumentUrl || "").trim()) {
      toast.error("Please upload the supporting PDF before submitting the POR request.")
      return
    }

    if (!formData.undertakingAccepted) {
      toast.error("Please accept the undertaking before submitting the POR request.")
      return
    }

    setSavingForm(true)

    try {
      if (editingRequest?.id) {
        await porApi.update(editingRequest.id, formData)
        toast.success("POR request resubmitted successfully.")
      } else {
        await porApi.create(formData)
        toast.success("POR request created successfully.")
      }

      setShowFormModal(false)
      setEditingRequest(null)
      setFormData(createDefaultForm())
      await fetchWorkspace({ keepLoading: true })
    } catch (err) {
      console.error("Failed to save POR request:", err)
      toast.error(err?.message || "Failed to save POR request.")
    } finally {
      setSavingForm(false)
    }
  }

  const openCreateCategoryModal = () => {
    setEditingCategory(null)
    setCategoryForm(createDefaultCategoryForm())
    setShowCategoryModal(true)
  }

  const openEditCategoryModal = (category) => {
    setEditingCategory(category)
    setCategoryForm({
      name: category?.name || "",
      gymkhanaSteps: (Array.isArray(category?.gymkhanaSteps) ? category.gymkhanaSteps : []).map((step, index) => ({
        label: step?.label || `Gymkhana Step ${index + 1}`,
        reviewerUserIds: Array.isArray(step?.reviewerUserIds) ? step.reviewerUserIds : [],
        reviewerPickerId: "",
      })),
    })
    setShowCategoryModal(true)
  }

  const closeCategoryManagerModal = () => {
    setShowCategoryManagerModal(false)
  }

  const handleCategoryNameChange = (value) => {
    setCategoryForm((current) => ({ ...current, name: value }))
  }

  const handleCategoryStepLabelChange = (stepIndex, value) => {
    setCategoryForm((current) => ({
      ...current,
      gymkhanaSteps: current.gymkhanaSteps.map((step, index) =>
        index === stepIndex ? { ...step, label: value } : step
      ),
    }))
  }

  const handleCategoryReviewerSelect = (stepIndex, value) => {
    setCategoryForm((current) => ({
      ...current,
      gymkhanaSteps: current.gymkhanaSteps.map((step, index) =>
        index === stepIndex ? { ...step, reviewerPickerId: value } : step
      ),
    }))
  }

  const handleAddCategoryReviewer = (stepIndex) => {
    setCategoryForm((current) => ({
      ...current,
      gymkhanaSteps: current.gymkhanaSteps.map((step, index) => {
        if (index !== stepIndex || !step.reviewerPickerId) return step
        if (step.reviewerUserIds.includes(step.reviewerPickerId)) {
          return { ...step, reviewerPickerId: "" }
        }

        return {
          ...step,
          reviewerUserIds: [...step.reviewerUserIds, step.reviewerPickerId],
          reviewerPickerId: "",
        }
      }),
    }))
  }

  const handleRemoveCategoryReviewer = (stepIndex, reviewerId) => {
    setCategoryForm((current) => ({
      ...current,
      gymkhanaSteps: current.gymkhanaSteps.map((step, index) =>
        index === stepIndex
          ? {
              ...step,
              reviewerUserIds: step.reviewerUserIds.filter((value) => value !== reviewerId),
            }
          : step
      ),
    }))
  }

  const handleAddCategoryStep = () => {
    setCategoryForm((current) => ({
      ...current,
      gymkhanaSteps: [...current.gymkhanaSteps, createEmptyCategoryStep(current.gymkhanaSteps.length)],
    }))
  }

  const handleRemoveCategoryStep = (stepIndex) => {
    setCategoryForm((current) => ({
      ...current,
      gymkhanaSteps: current.gymkhanaSteps.filter((_, index) => index !== stepIndex).map((step, index) => ({
        ...step,
        label: step.label || `Gymkhana Step ${index + 1}`,
      })),
    }))
  }

  const handleSubmitCategory = async () => {
    const normalizedName = String(categoryForm.name || "").trim()
    if (!normalizedName) {
      toast.error("Please enter a category name.")
      return
    }

    const normalizedSteps = (categoryForm.gymkhanaSteps || []).map((step) => {
      const reviewerUserIds = Array.from(
        new Set(
          [
            ...(Array.isArray(step.reviewerUserIds) ? step.reviewerUserIds : []),
            step.reviewerPickerId,
          ]
            .map((value) => String(value || "").trim())
            .filter(Boolean)
        )
      )

      return {
        label: String(step.label || "").trim(),
        reviewerUserIds,
      }
    })

    const invalidStep = normalizedSteps.find(
      (step) => !String(step.label || "").trim() || !Array.isArray(step.reviewerUserIds) || step.reviewerUserIds.length === 0
    )
    if (invalidStep) {
      toast.error("Every Gymkhana step needs a label and at least one reviewer.")
      return
    }

    const payload = {
      name: normalizedName,
      gymkhanaSteps: normalizedSteps,
    }

    setSavingCategory(true)
    try {
      if (editingCategory?.id) {
        await porApi.updateCategory(editingCategory.id, payload)
        toast.success("POR category updated successfully.")
      } else {
        await porApi.createCategory(payload)
        toast.success("POR category created successfully.")
      }

      setShowCategoryModal(false)
      setEditingCategory(null)
      setCategoryForm(createDefaultCategoryForm())
      await fetchWorkspace({ keepLoading: true })
    } catch (err) {
      console.error("Failed to save POR category:", err)
      toast.error(err?.message || "Failed to save POR category.")
    } finally {
      setSavingCategory(false)
    }
  }

  const openRequest = (request) => {
    setSelectedRequest(request)
    setSelectedRequestGroup(null)
    setReviewComment(request?.rejectionReason || "")
    setPostSaAssignments({})
  }

  const openRequestGroup = (group) => {
    setSelectedRequest(null)
    setSelectedRequestGroup(group)
    setGroupReviewComment("")
    setUseCommonGroupComment(true)
    setGroupRequestComments(buildGroupedRequestCommentState(group?.requests || []))
    setGroupPostSaAssignments({})
    setGroupActionLoading("")
  }

  const closeRequestModal = () => {
    setSelectedRequest(null)
    setReviewComment("")
    setPostSaAssignments({})
    setActionLoading("")
  }

  const closeRequestGroupModal = () => {
    setSelectedRequestGroup(null)
    setGroupReviewComment("")
    setUseCommonGroupComment(true)
    setGroupRequestComments({})
    setGroupPostSaAssignments({})
    setGroupActionLoading("")
  }

  const openTableRow = (row) => {
    if (row?.rowType === "group") {
      openRequestGroup(row)
      return
    }

    if (row?.request) {
      openRequest(row.request)
    }
  }

  const handleApprove = async () => {
    if (!selectedRequest?.id) return
    setActionLoading("approve")

    try {
      const nextApprovers = POST_SA_STAGE_ORDER
        .map((stage) => ({
          stage,
          userId: postSaAssignments[stage],
        }))
        .filter((assignment) => assignment.userId)

      await porApi.approve(selectedRequest.id, {
        comments: reviewComment,
        nextApprovers,
      })

      toast.success(
        selectedRequest?.currentApprovalStage === "Dean SA" ? "POR request approved." : "POR request recommended."
      )
      closeRequestModal()
      await fetchWorkspace({ keepLoading: true })
    } catch (err) {
      console.error("Failed to approve POR request:", err)
      toast.error(err?.message || "Failed to approve POR request.")
      setActionLoading("")
    }
  }

  const handleDirectApprove = async () => {
    if (!selectedRequest?.id) return
    setActionLoading("direct-approve")

    try {
      await porApi.approve(selectedRequest.id, {
        comments: reviewComment,
        directApprove: true,
      })

      toast.success("POR request approved.")
      closeRequestModal()
      await fetchWorkspace({ keepLoading: true })
    } catch (err) {
      console.error("Failed to directly approve POR request:", err)
      toast.error(err?.message || "Failed to approve POR request.")
      setActionLoading("")
    }
  }

  const handleReject = async () => {
    if (!selectedRequest?.id) return
    setActionLoading("reject")

    try {
      await porApi.reject(selectedRequest.id, reviewComment)
      toast.success("POR request rejected.")
      closeRequestModal()
      await fetchWorkspace({ keepLoading: true })
    } catch (err) {
      console.error("Failed to reject POR request:", err)
      toast.error(err?.message || "Failed to reject POR request.")
      setActionLoading("")
    }
  }

  const handleRequestRevision = async () => {
    if (!selectedRequest?.id) return
    setActionLoading("revision")

    try {
      await porApi.requestRevision(selectedRequest.id, reviewComment)
      toast.success("Modification requested successfully.")
      closeRequestModal()
      await fetchWorkspace({ keepLoading: true })
    } catch (err) {
      console.error("Failed to request POR revision:", err)
      toast.error(err?.message || "Failed to request modification.")
      setActionLoading("")
    }
  }

  const getGroupCommentForRequest = (requestId) =>
    useCommonGroupComment ? groupReviewComment : groupRequestComments?.[requestId] || ""

  const buildNextApproversPayload = (assignments = {}) =>
    POST_SA_STAGE_ORDER
      .map((stage) => ({
        stage,
        userId: assignments[stage],
      }))
      .filter((assignment) => assignment.userId)

  const handleGroupApprove = async () => {
    const requestsToProcess = selectedRequestGroup?.requests || []
    if (requestsToProcess.length === 0) return

    setGroupActionLoading("approve")

    try {
      const nextApprovers = buildNextApproversPayload(groupPostSaAssignments)
      const results = await Promise.allSettled(
        requestsToProcess.map((request) =>
          porApi.approve(request.id, {
            comments: getGroupCommentForRequest(request.id),
            nextApprovers,
          })
        )
      )

      const successCount = results.filter((result) => result.status === "fulfilled").length
      const failureCount = results.length - successCount
      const primaryDecisionLabel =
        selectedRequestGroup?.currentApprovalStage === "Dean SA" ? "approved" : "recommended"

      if (failureCount === 0) {
        toast.success(`${successCount} POR request${successCount === 1 ? "" : "s"} ${primaryDecisionLabel}.`)
      } else {
        toast.error(
          `${successCount} POR request${successCount === 1 ? "" : "s"} processed, ${failureCount} failed.`
        )
      }

      closeRequestGroupModal()
      await fetchWorkspace({ keepLoading: true })
    } catch (err) {
      console.error("Failed to process grouped POR approval:", err)
      toast.error(err?.message || "Failed to process grouped POR requests.")
      setGroupActionLoading("")
    }
  }

  const handleGroupDirectApprove = async () => {
    const requestsToProcess = selectedRequestGroup?.requests || []
    if (requestsToProcess.length === 0) return

    setGroupActionLoading("direct-approve")

    try {
      const results = await Promise.allSettled(
        requestsToProcess.map((request) =>
          porApi.approve(request.id, {
            comments: getGroupCommentForRequest(request.id),
            directApprove: true,
          })
        )
      )

      const successCount = results.filter((result) => result.status === "fulfilled").length
      const failureCount = results.length - successCount

      if (failureCount === 0) {
        toast.success(`${successCount} POR request${successCount === 1 ? "" : "s"} approved.`)
      } else {
        toast.error(
          `${successCount} POR request${successCount === 1 ? "" : "s"} approved, ${failureCount} failed.`
        )
      }

      closeRequestGroupModal()
      await fetchWorkspace({ keepLoading: true })
    } catch (err) {
      console.error("Failed to directly approve grouped POR requests:", err)
      toast.error(err?.message || "Failed to approve grouped POR requests.")
      setGroupActionLoading("")
    }
  }

  const handleGroupReject = async () => {
    const requestsToProcess = selectedRequestGroup?.requests || []
    if (requestsToProcess.length === 0) return

    setGroupActionLoading("reject")

    try {
      const results = await Promise.allSettled(
        requestsToProcess.map((request) => porApi.reject(request.id, getGroupCommentForRequest(request.id)))
      )

      const successCount = results.filter((result) => result.status === "fulfilled").length
      const failureCount = results.length - successCount

      if (failureCount === 0) {
        toast.success(`${successCount} POR request${successCount === 1 ? "" : "s"} rejected.`)
      } else {
        toast.error(
          `${successCount} POR request${successCount === 1 ? "" : "s"} rejected, ${failureCount} failed.`
        )
      }

      closeRequestGroupModal()
      await fetchWorkspace({ keepLoading: true })
    } catch (err) {
      console.error("Failed to process grouped POR rejection:", err)
      toast.error(err?.message || "Failed to reject grouped POR requests.")
      setGroupActionLoading("")
    }
  }

  const handleGroupRequestRevision = async () => {
    const requestsToProcess = selectedRequestGroup?.requests || []
    if (requestsToProcess.length === 0) return

    setGroupActionLoading("revision")

    try {
      const results = await Promise.allSettled(
        requestsToProcess.map((request) =>
          porApi.requestRevision(request.id, getGroupCommentForRequest(request.id))
        )
      )

      const successCount = results.filter((result) => result.status === "fulfilled").length
      const failureCount = results.length - successCount

      if (failureCount === 0) {
        toast.success(`Modification requested for ${successCount} POR request${successCount === 1 ? "" : "s"}.`)
      } else {
        toast.error(
          `Modification requested for ${successCount} POR request${successCount === 1 ? "" : "s"}, ${failureCount} failed.`
        )
      }

      closeRequestGroupModal()
      await fetchWorkspace({ keepLoading: true })
    } catch (err) {
      console.error("Failed to request grouped POR revisions:", err)
      toast.error(err?.message || "Failed to request grouped POR modifications.")
      setGroupActionLoading("")
    }
  }

  if (loading) {
    return <LoadingState message="Loading POR workspace..." />
  }

  if (error) {
    return <ErrorState message={error} />
  }

  if (!viewer?.mode || viewer.mode === "unknown" || viewer.mode === "admin_other") {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="POR Workspace Unavailable"
        message="Your account is not configured for the POR workflow."
      />
    )
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={getViewerTitle(viewer.mode)}
        subtitle={getViewerSubtitle(viewer.mode)}
      >
        {viewer.canCreate ? (
          <Button onClick={openCreateModal}>
            <FilePenLine size={16} />
            Create POR Request
          </Button>
        ) : null}
        {viewer.canManageCategories ? (
          <Button variant="secondary" onClick={() => setShowCategoryManagerModal(true)}>
            <Settings2 size={16} />
            Manage Categories
          </Button>
        ) : null}
      </PageHeader>

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <Tabs
              variant="pills"
              tabs={statusTabs}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>

          <div className="w-full lg:w-96">
            <Input
              type="text"
              icon={<UserRoundSearch size={16} />}
              value={searchTerm}
              placeholder="Search POR requests..."
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>

        <div style={{ marginTop: "var(--spacing-4)" }}>
          {requests.length === 0 ? (
            <EmptyState
              icon={BadgeCheck}
              title="No POR Requests Yet"
              message={
                viewer.canCreate
                  ? "Create your first POR request to start the verification flow."
                  : "No POR requests are available in your workspace yet."
              }
            />
          ) : (
            <DataTable
              columns={tableColumns}
              data={tableRows}
              loading={false}
              emptyMessage="No POR requests match the current filters."
              onRowClick={openTableRow}
            />
          )}
        </div>
      </div>

      <PorRequestFormModal
        isOpen={showFormModal}
        isSaving={savingForm}
        porCategories={porCategories}
        formData={formData}
        onChange={handleFormChange}
        onClose={() => {
          setShowFormModal(false)
          setEditingRequest(null)
          setFormData(createDefaultForm())
        }}
        onSubmit={handleSubmitForm}
        isEdit={Boolean(editingRequest)}
      />

      <PorCategoryManagementModal
        isOpen={showCategoryManagerModal}
        categories={porCategories}
        onClose={closeCategoryManagerModal}
        onAdd={openCreateCategoryModal}
        onEdit={openEditCategoryModal}
      />

      <PorCategoryFormModal
        isOpen={showCategoryModal}
        isSaving={savingCategory}
        formData={categoryForm}
        reviewerOptions={gymkhanaReviewerOptions}
        onChangeName={handleCategoryNameChange}
        onChangeStepLabel={handleCategoryStepLabelChange}
        onSelectReviewer={handleCategoryReviewerSelect}
        onAddReviewer={handleAddCategoryReviewer}
        onRemoveReviewer={handleRemoveCategoryReviewer}
        onAddStep={handleAddCategoryStep}
        onRemoveStep={handleRemoveCategoryStep}
        onClose={() => {
          setShowCategoryModal(false)
          setEditingCategory(null)
          setCategoryForm(createDefaultCategoryForm())
        }}
        onSubmit={handleSubmitCategory}
        isEdit={Boolean(editingCategory)}
      />

      <PorRequestDetailModal
        isOpen={Boolean(selectedRequest)}
        request={selectedRequest}
        viewer={viewer}
        approversByStage={workspace.approversByStage}
        reviewComment={reviewComment}
        onReviewCommentChange={setReviewComment}
        postSaAssignments={postSaAssignments}
        onPostSaAssignmentChange={(stage, value) =>
          setPostSaAssignments((current) => ({ ...current, [stage]: value }))
        }
        onClose={closeRequestModal}
        onApprove={handleApprove}
        onDirectApprove={handleDirectApprove}
        onReject={handleReject}
        onRequestRevision={handleRequestRevision}
        onEdit={() => openEditModal(selectedRequest)}
        actionLoading={actionLoading}
      />

      <PorRequestGroupModal
        isOpen={Boolean(selectedRequestGroup)}
        group={selectedRequestGroup}
        viewer={viewer}
        approversByStage={workspace.approversByStage}
        useCommonComment={useCommonGroupComment}
        onUseCommonCommentChange={setUseCommonGroupComment}
        commonReviewComment={groupReviewComment}
        onCommonReviewCommentChange={setGroupReviewComment}
        perRequestComments={groupRequestComments}
        onPerRequestCommentChange={(requestId, value) =>
          setGroupRequestComments((current) => ({ ...current, [requestId]: value }))
        }
        postSaAssignments={groupPostSaAssignments}
        onPostSaAssignmentChange={(stage, value) =>
          setGroupPostSaAssignments((current) => ({ ...current, [stage]: value }))
        }
        onClose={closeRequestGroupModal}
        onApprove={handleGroupApprove}
        onDirectApprove={handleGroupDirectApprove}
        onReject={handleGroupReject}
        onRequestRevision={handleGroupRequestRevision}
        onOpenIndividual={(request) => openRequest(request)}
        actionLoading={groupActionLoading}
      />
    </div>
  )
}

export default PorRequestsPage
