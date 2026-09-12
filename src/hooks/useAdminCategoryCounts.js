import { useQuery } from "@tanstack/react-query"
import { useAuth } from "../contexts/AuthProvider"
import { dashboardApi } from "../service"
import gymkhanaEventsApi from "../service/modules/gymkhanaEvents.api"
import overallBestPerformerApi from "../service/modules/overallBestPerformer.api"
import porApi from "../service/modules/por.api"
import { queryKeys } from "../lib/query/queryKeys"

const asCount = (value) => {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : 0
}

const EMPTY_COUNTS = { categoryCounts: {}, itemCounts: {} }
const EMPTY_APPROVALS = { proposals: 0, megaProposals: 0, calendars: 0, expenses: 0, por: 0 }

const APPROVAL_STAGE_STATUS = {
  "Student Affairs": "pending_student_affairs",
  "Officer SA": "pending_officer",
  "Associate Dean SA": "pending_associate_dean",
  "Dean SA": "pending_dean",
}

const unwrap = (response) => response?.data ?? response ?? {}

const isPendingForUser = (item, userId) => {
  const single = item?.currentApproverUser?._id || item?.currentApproverUser
  const multi = (item?.currentApproverUsers || []).map((user) => String(user?._id || user))
  if (!single && multi.length === 0) return true
  if (single && String(single) === userId) return true
  return userId ? multi.includes(userId) : false
}

export const pickLatestAwardOccurrence = (occurrences) => {
  if (!Array.isArray(occurrences) || occurrences.length === 0) return null
  return [...occurrences].sort((left, right) => {
    const yearDelta = (Number(right.awardYear) || 0) - (Number(left.awardYear) || 0)
    if (yearDelta) return yearDelta
    return new Date(right.applyEndAt || 0).getTime() - new Date(left.applyEndAt || 0).getTime()
  })[0]
}

export const isBestPerformerCountVisible = (applyEndAt, now = new Date()) => {
  if (!applyEndAt) return false
  const applyEnd = new Date(applyEndAt)
  if (Number.isNaN(applyEnd.getTime())) return false
  const visibleUntil = new Date(applyEnd)
  visibleUntil.setMonth(visibleUntil.getMonth() + 1)
  return now < visibleUntil
}

const addCount = (itemCounts, categoryCounts, category, path, value) => {
  const count = asCount(value)
  if (!count || !path) return
  itemCounts[path] = (itemCounts[path] || 0) + count
  if (category) categoryCounts[category] = (categoryCounts[category] || 0) + count
}

export const fetchAdminApprovalCounts = async (user) => {
  const myStage = APPROVAL_STAGE_STATUS[user?.subRole]
  const meId = user?._id ? String(user._id) : null
  const next = { ...EMPTY_APPROVALS }

  const [proposalsRes, megaProposalsRes, expensesRes, calendarsRes, porRes] = await Promise.allSettled([
    gymkhanaEventsApi.getProposalsForApproval(),
    gymkhanaEventsApi.getMegaProposalsForApproval(),
    myStage ? gymkhanaEventsApi.getAllExpenses({ limit: 1 }) : Promise.resolve(null),
    myStage ? gymkhanaEventsApi.getCalendars({ status: myStage, limit: 100 }) : Promise.resolve(null),
    myStage ? porApi.getWorkspace() : Promise.resolve(null),
  ])

  if (proposalsRes.status === "fulfilled") {
    const data = unwrap(proposalsRes.value)
    next.proposals = Array.isArray(data.proposals) ? data.proposals.length : 0
  }
  if (megaProposalsRes.status === "fulfilled") {
    const data = unwrap(megaProposalsRes.value)
    next.megaProposals = Array.isArray(data.occurrences) ? data.occurrences.length : 0
  }
  if (expensesRes.status === "fulfilled" && expensesRes.value) {
    const data = unwrap(expensesRes.value)
    next.expenses = data.pagination?.total ?? (Array.isArray(data.expenses) ? data.expenses.length : 0)
  }
  if (calendarsRes.status === "fulfilled" && calendarsRes.value) {
    const data = unwrap(calendarsRes.value)
    const list = Array.isArray(data.data) ? data.data : Array.isArray(data.calendars) ? data.calendars : []
    next.calendars = list.filter((calendar) => calendar.status === myStage && isPendingForUser(calendar, meId)).length
  }
  if (porRes.status === "fulfilled" && porRes.value) {
    const data = unwrap(porRes.value)
    const list = Array.isArray(data.requests) ? data.requests : []
    next.por = list.filter((request) => request.status === myStage && isPendingForUser(request, meId)).length
  }

  return next
}

export const deriveAdminSidebarCounts = (dashboardData, approvals = EMPTY_APPROVALS, awardApplyEndAt = null) => {
  if (!dashboardData || typeof dashboardData !== "object") return EMPTY_COUNTS

  const complaints = dashboardData.complaints || {}
  const ops = dashboardData.ops || {}
  const dining = dashboardData.dining || {}
  const itemCounts = {}
  const categoryCounts = {}

  addCount(itemCounts, categoryCounts, "hostels", "/admin/complaints", complaints.pending)
  addCount(itemCounts, categoryCounts, "hostels", "/admin/visitors", ops.visitors?.pending)
  addCount(itemCounts, categoryCounts, "hostels", "/admin/feedbacks", ops.feedbacks?.pending)
  addCount(itemCounts, categoryCounts, "hostels", "/admin/task-management", ops.tasks?.overdue)
  addCount(itemCounts, categoryCounts, "hostels", "/admin/inventory", ops.inventory?.empty)
  addCount(itemCounts, categoryCounts, "hostels", "/admin/leaves", ops.leaves?.pending)

  addCount(itemCounts, categoryCounts, "student-affairs", "/admin/gymkhana-events",
    asCount(approvals.proposals) + asCount(approvals.calendars) + asCount(approvals.expenses))
  addCount(itemCounts, categoryCounts, "student-affairs", "/admin/mega-events", approvals.megaProposals)
  addCount(itemCounts, categoryCounts, "student-affairs", "/admin/por", approvals.por)
  addCount(itemCounts, categoryCounts, "student-affairs", "/admin/elections", ops.elections?.nominationsPending)
  if (isBestPerformerCountVisible(awardApplyEndAt)) {
    addCount(itemCounts, categoryCounts, "student-affairs", "/admin/overall-best-performer", ops.awards?.submitted)
  }

  addCount(itemCounts, categoryCounts, "dining", "/admin/dining-rebates", dining.rebates?.pending)

  const allAttention = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0)
  if (categoryCounts.hostels) itemCounts["/admin/dashboard/hostels"] = categoryCounts.hostels
  if (categoryCounts["student-affairs"]) itemCounts["/admin/dashboard/student-affairs"] = categoryCounts["student-affairs"]
  if (categoryCounts.dining) itemCounts["/admin/dashboard/dining"] = categoryCounts.dining
  if (allAttention) itemCounts["/admin"] = allAttention

  return { categoryCounts, itemCounts }
}

export const deriveAdminCategoryCounts = (dashboardData, approvals, awardApplyEndAt) =>
  deriveAdminSidebarCounts(dashboardData, approvals, awardApplyEndAt).categoryCounts

const useAdminCategoryCounts = (enabled) => {
  const { user } = useAuth()

  const dashboardQuery = useQuery({
    queryKey: queryKeys.adminDashboard.data(),
    queryFn: async () => {
      const response = await dashboardApi.getAdminDashboardData()
      return response?.data ?? response
    },
    enabled,
    staleTime: 60_000,
    refetchInterval: 120_000,
  })

  const approvalQuery = useQuery({
    queryKey: queryKeys.adminDashboard.approvals(user?._id, user?.subRole),
    queryFn: () => fetchAdminApprovalCounts(user),
    enabled: enabled && Boolean(user?._id),
    staleTime: 60_000,
    refetchInterval: 120_000,
  })

  const awardQuery = useQuery({
    queryKey: queryKeys.adminDashboard.awardWindow(),
    queryFn: async () => {
      const response = await overallBestPerformerApi.getOccurrenceSelector()
      const data = unwrap(response)
      return pickLatestAwardOccurrence(data.occurrences)?.applyEndAt || null
    },
    enabled,
    staleTime: 60_000,
    refetchInterval: 120_000,
  })

  return deriveAdminSidebarCounts(dashboardQuery.data, approvalQuery.data, awardQuery.data)
}

export default useAdminCategoryCounts
