import { formatStatusLabel } from "@/components/por/porStatus"

export const isPendingStatus = (status) => String(status || "").startsWith("pending_")

export const getStatusTabLabel = (status) => {
  if (status === "all") return "All"
  if (status === "action_required") return "Action Required"
  if (status === "pending") return "Pending"
  return formatStatusLabel(status)
}

export const buildStatusTabs = (requests = []) => {
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

export const getViewerTitle = (mode) => {
  if (mode === "student") return "POR Requests"
  if (mode === "club") return "Club POR Requests"
  if (mode === "gs") return "GS POR Requests"
  if (mode === "president") return "President POR Requests"
  if (mode === "gymkhana") return "Gymkhana POR Requests"
  return "POR Verification"
}

export const getViewerSubtitle = (mode) => {
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

export const shouldShowStudentColumn = (viewer) => viewer?.mode !== "student"

export const shouldShowCategoryColumn = (viewer) => viewer?.mode !== "student"

export const buildPorCategoryOptions = (porCategories = []) =>
  (Array.isArray(porCategories) ? porCategories : []).map((category) => ({
    value: category.id,
    label: category.name || "POR Category",
  }))

export const isGroupedReviewEligible = (request, viewer) =>
  viewer?.mode !== "student" &&
  Boolean(request?.permissions?.canApprove) &&
  isPendingStatus(request?.status) &&
  Boolean(request?.student?.id || request?.student?._id || request?.student?.rollNumber || request?.student?.email) &&
  Boolean(request?.currentApprovalStage)

export const buildGroupedReviewKey = (request) => {
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

export const buildGroupSummary = (requests = []) => {
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

export const buildTableRows = (requests = [], viewer = {}) => {
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
      categories: summary.categories,
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

export const buildGroupedRequestCommentState = (requests = []) =>
  requests.reduce((acc, request) => {
    acc[request.id] = request?.rejectionReason || ""
    return acc
  }, {})
