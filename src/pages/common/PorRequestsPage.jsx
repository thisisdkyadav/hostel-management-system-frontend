import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { DataTable, Tabs, Button, Input } from "hzero"
import { Field, Grid, HStack, Modal, Surface, Text, VStack } from "@/components/ui"
import { renderCertificate, downloadBytes } from "pdf-certificate-kit"
import { BadgeCheck, Building2, CalendarDays, Clock3, Download, FilePenLine, FileText, Plus, Settings2, ShieldAlert, ShieldCheck, Trash2, UserRoundSearch, Users } from "lucide-react"
import { useToast } from "@/components/ui/feedback"
import PageHeader from "../../components/common/PageHeader"
import StudentDetailModal from "../../components/common/students/StudentDetailModal"
import PdfUploadField from "../../components/common/pdf/PdfUploadField"
import SharedPorRequestDetailModal from "../../components/por/PorRequestDetailModal"
import { Badge, Checkbox, EmptyState, ErrorState, Label, LoadingState, Select, Textarea, ToggleButtonGroup } from "@/components/ui"
import { porApi, studentApi } from "@/service"
import "../../styles/por-requests.css"

import { POST_SA_STAGE_ORDER, formatDateTime, formatStageLabel, formatStatusLabel, getStatusVariant } from "@/components/por/porStatus"
import { buildGroupedRequestCommentState, buildStatusTabs, buildTableRows, getViewerSubtitle, getViewerTitle, isPendingStatus, shouldShowCategoryColumn, shouldShowStudentColumn } from "./por-requests/listView"
import { buildPorCsvContent } from "./por-requests/documents"
import { createDefaultCategoryForm, createDefaultForm, createEmptyCategoryStep } from "./por-requests/form"
import { PorRequestFormModal } from "./por-requests/PorRequestFormModal"
import { PorCategoryFormModal, PorCategoryManagementModal } from "./por-requests/PorCategoryModals"
import { PorRequestGroupModal } from "./por-requests/PorRequestGroupModal"








































const PorRequestsPage = () => {
  const { toast } = useToast()
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
  const [selectedRequestStudentId, setSelectedRequestStudentId] = useState(null)
  const [showSelectedRequestStudentDetail, setShowSelectedRequestStudentDetail] = useState(false)
  const [selectedRequestGroup, setSelectedRequestGroup] = useState(null)
  const [formData, setFormData] = useState(createDefaultForm())
  const [savingForm, setSavingForm] = useState(false)
  const [hasPendingSupportingDoc, setHasPendingSupportingDoc] = useState(false)
  const [reviewComment, setReviewComment] = useState("")
  const [groupReviewComment, setGroupReviewComment] = useState("")
  const [useCommonGroupComment, setUseCommonGroupComment] = useState(true)
  const [groupRequestComments, setGroupRequestComments] = useState({})
  const [postSaAssignments, setPostSaAssignments] = useState({})
  const [groupPostSaAssignments, setGroupPostSaAssignments] = useState({})
  const [actionLoading, setActionLoading] = useState("")
  const [groupActionLoading, setGroupActionLoading] = useState("")
  const [generatingCertificateId, setGeneratingCertificateId] = useState(null)
  const [showCategoryManagerModal, setShowCategoryManagerModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryForm, setCategoryForm] = useState(createDefaultCategoryForm())
  const [savingCategory, setSavingCategory] = useState(false)
  const [searchParams] = useSearchParams()
  const handledRequestParamRef = useRef(null)

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

  // Open a specific request's detail modal when deep-linked via ?request=<id> (from approval emails)
  useEffect(() => {
    const requestId = searchParams.get("request")
    if (!requestId || loading) return
    if (handledRequestParamRef.current === requestId) return
    const match = requests.find(
      (entry) => String(entry?.id) === String(requestId) || String(entry?._id) === String(requestId)
    )
    if (match) {
      handledRequestParamRef.current = requestId
      setSelectedRequest(match)
      setSelectedRequestGroup(null)
    }
  }, [searchParams, requests, loading])

  useEffect(() => {
    let isSubscribed = true

    const loadSelectedRequestStudentId = async () => {
      const canViewStudentProfile = Boolean(
        selectedRequest?.student?.userId && viewer?.mode !== "student"
      )

      if (!canViewStudentProfile) {
        if (isSubscribed) {
          setSelectedRequestStudentId(null)
          setShowSelectedRequestStudentDetail(false)
        }
        return
      }

      try {
        const resolvedStudentId = await studentApi.getStudentId(selectedRequest.student.userId)
        if (!isSubscribed) return
        setSelectedRequestStudentId(resolvedStudentId || null)
      } catch (err) {
        console.error("Failed to resolve POR student profile id:", err)
        if (!isSubscribed) return
        setSelectedRequestStudentId(null)
      }
    }

    loadSelectedRequestStudentId()

    return () => {
      isSubscribed = false
    }
  }, [selectedRequest?.student?.userId, viewer?.mode])

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

  // Export exactly what the current filter (status tab + search) shows, one row per POR
  // request (ungrouped). Visibility is already scoped server-side, so filteredRequests is
  // precisely "all POR visible to this user in this filter".
  const exportFilteredRequestsCsv = () => {
    if (!filteredRequests.length) {
      toast.error("No POR requests to export.")
      return
    }

    const csvContent = buildPorCsvContent(filteredRequests, viewer)
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const date = new Date().toISOString().split("T")[0]
    link.href = URL.createObjectURL(blob)
    link.download = `por_requests_${activeTab}_${date}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)

    toast.success(
      `Exported ${filteredRequests.length} POR request${filteredRequests.length === 1 ? "" : "s"}.`
    )
  }

  // Generate a certificate PDF for a single POR on the fly: fetch the admin-configured
  // template + resolved data + signatures (as data URLs), render with pdf-certificate-kit, and download.
  const handleGenerateCertificate = async (request) => {
    if (!request?.id) return
    setGeneratingCertificateId(request.id)
    try {
      const payload = await porApi.getCertificateData(request.id)
      const bytes = await renderCertificate({
        template: payload?.template || {},
        data: payload?.data || {},
        signatures: Array.isArray(payload?.signatures) ? payload.signatures : [],
        meta: { title: "POR Certificate", subject: payload?.request?.positionTitle || "" },
      })
      const student = payload?.request?.student || request.student || {}
      const slug = String(student.rollNumber || student.name || request.id)
        .trim()
        .replace(/[^a-zA-Z0-9._-]+/g, "_")
      downloadBytes(bytes, `POR_Certificate_${slug}.pdf`)
      toast.success("Certificate generated")
    } catch (error) {
      console.error("Failed to generate certificate:", error)
      toast.error(error?.message || "Failed to generate certificate")
    } finally {
      setGeneratingCertificateId(null)
    }
  }

  const tableColumns = useMemo(() => {
    const columns = []

    if (shouldShowStudentColumn(viewer)) {
      columns.push({
        header: "Student",
        key: "student",
        render: (row) => {
          const student = row.rowType === "group" ? row.student : row.request?.student
          return (
          <Grid cols={1} gap="4px">
            <Text as="div" weight="medium" color="primary">
                {student?.name || "—"}
            </Text>
            <Text as="div" size="sm" color="muted">
                {student?.rollNumber || "—"}
            </Text>
          </Grid>
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
              <Grid cols={1} gap="4px">
                <Text as="div" weight="medium" color="primary">
                  {row.requestCount} POR requests
                </Text>
                <Text as="div" size="sm" color="muted">
                  {categoryLabel}
                </Text>
                {clubs.length > 0 ? (
                  <Text as="div" size="sm" color="muted">
                    {clubs.length === 1 ? clubs[0] : `${clubs.length} clubs`}
                  </Text>
                ) : null}
                <Text as="div" size="sm" color="muted">
                  {positionsPreview || "Multiple positions"}
                </Text>
              </Grid>
            )
          }

          const request = row.request
          return (
            <Grid cols={1} gap="4px">
              <Text as="div" weight="medium" color="primary">
                {request.porCategoryName || "—"}
              </Text>
              <Text as="div" size="sm" color="muted">
                {request.positionTitle || "—"}
              </Text>
              {request.club?.name ? (
                <Text as="div" size="sm" color="muted">
                  Club: {request.club.name}
                </Text>
              ) : null}
            </Grid>
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
          <HStack gap="8px" wrap>
              <Badge variant={getStatusVariant(status)}>{formatStatusLabel(status)}</Badge>
              {isActionRequired ? <Badge variant="warning">Action Required</Badge> : null}
              {row.rowType === "group" ? <Badge variant="info">Grouped</Badge> : null}
          </HStack>
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
    setHasPendingSupportingDoc(false)
    setShowFormModal(true)
  }

  const openEditModal = (request) => {
    setEditingRequest(request)
    setHasPendingSupportingDoc(false)
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
    if (!Array.isArray(porCategories) || porCategories.length === 0) {
      toast.error("No POR categories are available yet. Please contact an administrator.")
      return
    }

    if (!String(formData.porCategoryId || "").trim()) {
      toast.error("Please select a POR category.")
      return
    }

    if (!String(formData.positionTitle || "").trim()) {
      toast.error("Please enter the position of responsibility.")
      return
    }

    if (!String(formData.tenure || "").trim()) {
      toast.error("Please enter the tenure.")
      return
    }

    if (!String(formData.positionDetails || "").trim()) {
      toast.error("Please enter the POR details.")
      return
    }

    if (!String(formData.supportingDocumentUrl || "").trim()) {
      if (hasPendingSupportingDoc) {
        toast.error("You selected a PDF but haven't uploaded it yet. Please click the Upload button.")
      } else {
        toast.error("Please upload the supporting PDF before submitting the POR request.")
      }
      return
    }

    if (formData.hasDisciplinaryAction !== true && formData.hasDisciplinaryAction !== false) {
      toast.error("Please answer the disciplinary action question before submitting the POR request.")
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
      setHasPendingSupportingDoc(false)
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
    setSelectedRequestStudentId(null)
    setShowSelectedRequestStudentDetail(false)
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
        <Button
          variant="secondary"
          onClick={exportFilteredRequestsCsv}
          disabled={filteredRequests.length === 0}
        >
          <Download size={16} />
          Export CSV
        </Button>
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
          setHasPendingSupportingDoc(false)
        }}
        onSubmit={handleSubmitForm}
        onSupportingDocPendingChange={setHasPendingSupportingDoc}
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

      <SharedPorRequestDetailModal
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
        canViewStudentProfile={Boolean(selectedRequest?.student?.userId && selectedRequestStudentId)}
        onOpenStudentProfile={() => setShowSelectedRequestStudentDetail(true)}
        onGenerateCertificate={selectedRequest?.status === "approved" ? handleGenerateCertificate : undefined}
        isGeneratingCertificate={generatingCertificateId === selectedRequest?.id}
      />

      {showSelectedRequestStudentDetail && selectedRequestStudentId && selectedRequest?.student?.userId ? (
        <StudentDetailModal
          selectedStudent={{ _id: selectedRequestStudentId, userId: selectedRequest.student.userId }}
          setShowStudentDetail={setShowSelectedRequestStudentDetail}
          onUpdate={() => setShowSelectedRequestStudentDetail(false)}
        />
      ) : null}

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
