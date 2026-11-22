import { accommodationApi, adminApi, complaintApi, electionsApi, eventsApi, feedbackApi, idCardApi, lostAndFoundApi, notificationApi, securityApi, studentApi, studentProfileApi, undertakingApi } from "../../service"
import { queryKeys } from "../../lib/query"
import { studentDiningPortalQuery, studentDiningTagsQuery } from "../dining/student/portalQuery"
import { addDays, weekStartOf } from "../dining/menu/menuHelpers"
import { localTodayKey } from "../dining/caterer/catererHelpers"

/**
 * Every query the phone pages use, in one place, so the pages and the
 * background preloader (usePhonePreload) share the exact same keys.
 */

const DASHBOARD_CACHE_KEY = "student_dashboard_data"

const normalizeDashboard = (payload) => {
  const data = payload?.data && typeof payload.data === "object" ? payload.data : payload
  return data?.profile ? data : null
}

/** Last dashboard seen on this device, for offline / error fallbacks. */
export const readDashboardCache = () => {
  try {
    return normalizeDashboard(JSON.parse(localStorage.getItem(DASHBOARD_CACHE_KEY) || "null")?.data)
  } catch {
    return null
  }
}

export const dashboardQuery = () => ({
  queryKey: queryKeys.studentDashboard.data(),
  queryFn: async () => {
    const data = normalizeDashboard(await studentApi.getStudentDashboard())
    if (!data) throw new Error("Student dashboard response is missing profile data")
    try {
      localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify({ data, timestamp: new Date().toISOString() }))
    } catch {
      /* storage full or blocked */
    }
    return data
  },
})

export const mealsQuery = () => ({ queryKey: queryKeys.dining.meals(), queryFn: () => studentApi.getDiningMeals(), retry: false })
export const votingQuery = () => ({ queryKey: queryKeys.studentDashboard.activeVotingElection(), queryFn: () => electionsApi.getStudentCurrent() })
export const undertakingsCountQuery = () => ({ queryKey: ["undertakings", "pending-count"], queryFn: () => undertakingApi.pendingUndertakingsCount(), retry: false })

export const COMPLAINTS_PAGE_SIZE = 15

export const complaintsListQuery = (status = "all") => ({
  queryKey: [...queryKeys.complaints.list({ status, phone: true })],
  queryFn: ({ pageParam }) => {
    const params = new URLSearchParams()
    if (status !== "all") params.append("status", status)
    params.append("page", pageParam)
    params.append("limit", COMPLAINTS_PAGE_SIZE)
    return adminApi.getAllComplaints(params.toString())
  },
  initialPageParam: 1,
  getNextPageParam: (last, pages) => {
    const totalPages = last?.data?.pagination?.totalPages || 1
    return pages.length < totalPages ? pages.length + 1 : undefined
  },
})

export const complaintStatsQuery = () => ({ queryKey: queryKeys.complaints.stats(null), queryFn: () => complaintApi.getStats({}) })

export const diningRebatesQuery = () => ({ queryKey: queryKeys.dining.rebates(), queryFn: () => studentApi.getDiningRebates() })
export const diningBillingQuery = () => ({ queryKey: queryKeys.dining.billing(), queryFn: () => studentApi.getDiningBilling(), retry: false })
export const diningTagsQuery = () => ({ ...studentDiningTagsQuery(), retry: false })
export { studentDiningPortalQuery }

/** Same key/fn as useStudentMenuWeek, for the week starting `weekStart`. */
export const menuWeekQuery = (weekStart) => {
  const params = { from: weekStart, to: addDays(weekStart, 6) }
  return { queryKey: queryKeys.dining.menu(params), queryFn: () => studentApi.getDiningMenu(params), retry: false }
}

export const phoneEventsQuery = (filter = "upcoming") => ({
  queryKey: ["events", "phone", filter],
  queryFn: ({ pageParam }) => eventsApi.getAllEvents({ page: pageParam, limit: 20, filter, search: "" }),
  initialPageParam: 1,
  getNextPageParam: (last) => (last?.pagination?.hasMore ? (last.pagination.page || 1) + 1 : undefined),
})

// ---- pages in the More sheet ----

export const notificationsQuery = (expiry = "active") => ({
  queryKey: [...queryKeys.notifications.all, "phone", expiry],
  queryFn: () => notificationApi.getNotifications(`page=1&limit=50${expiry === "all" ? "" : `&expiryStatus=${expiry}`}`),
})

export const lostFoundQuery = (status = "all") => ({
  queryKey: [...queryKeys.lostAndFound.all, "phone", status],
  queryFn: () => lostAndFoundApi.getAllLostItems({ page: 1, limit: 50, ...(status === "all" ? {} : { status }) }),
})

export const feedbacksQuery = () => ({
  queryKey: [...queryKeys.feedback.all, "phone"],
  queryFn: () => feedbackApi.getFeedbacks({ page: 1, limit: 50 }),
})

export const idCardQuery = (userId) => ({ queryKey: queryKeys.idCard.mine(userId), queryFn: () => idCardApi.getIDcard(userId) })

export const securityEntriesQuery = () => ({
  queryKey: [...queryKeys.securityEntries.all, "phone"],
  queryFn: () => securityApi.getStudentEntries({ page: 1, limit: 40 }),
})

export const undertakingListsQuery = () => ({
  queryKey: queryKeys.undertakings.studentLists(),
  queryFn: async () => {
    const [pending, accepted] = await Promise.all([undertakingApi.getPendingUndertakings(), undertakingApi.getAcceptedUndertakings()])
    return { pendingUndertakings: pending.pendingUndertakings || [], acceptedUndertakings: accepted.acceptedUndertakings || [] }
  },
})

export const visitorRequestsQuery = () => ({
  queryKey: queryKeys.accommodationRequests.list({ limit: 100 }),
  queryFn: () => accommodationApi.listRequests({ limit: 100 }),
})

export const myProfileQuery = () => ({ queryKey: ["student-phone", "profile"], queryFn: () => studentApi.getStudent() })
export const myHealthQuery = () => ({ queryKey: ["student-phone", "health"], queryFn: () => studentProfileApi.getHealthDetails(), retry: false })

/** The More-sheet pages: preloaded too, refreshed less often (usePhonePreload). */
export const morePreloadQueries = (userId) => [
  notificationsQuery(),
  lostFoundQuery(),
  feedbacksQuery(),
  securityEntriesQuery(),
  undertakingListsQuery(),
  visitorRequestsQuery(),
  myProfileQuery(),
  myHealthQuery(),
  ...(userId ? [idCardQuery(userId)] : []),
]

/** Everything the bottom-bar pages show on first paint. */
export const preloadQueries = () => {
  const thisWeek = weekStartOf(localTodayKey())
  return [
    dashboardQuery(),
    mealsQuery(),
    votingQuery(),
    undertakingsCountQuery(),
    complaintStatsQuery(),
    studentDiningPortalQuery(),
    diningRebatesQuery(),
    diningBillingQuery(),
    diningTagsQuery(),
    menuWeekQuery(thisWeek),
    menuWeekQuery(addDays(thisWeek, 7)),
  ]
}
