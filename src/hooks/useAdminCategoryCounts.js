import { useQuery } from "@tanstack/react-query"
import { dashboardApi } from "../service"
import { queryKeys } from "../lib/query/queryKeys"

const asCount = (value) => {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : 0
}

export const deriveAdminCategoryCounts = (dashboardData) => {
  if (!dashboardData || typeof dashboardData !== "object") return {}

  const complaints = dashboardData.complaints || {}
  const ops = dashboardData.ops || {}
  const dining = dashboardData.dining || {}
  const inProcess = Array.isArray(dashboardData.inProcess) ? dashboardData.inProcess : []

  return {
    hostels:
      asCount(complaints.pending) +
      asCount(complaints.inProgress) +
      asCount(complaints.forwardedToIDO) +
      asCount(ops.tasks?.overdue) +
      asCount(ops.feedbacks?.pending) +
      asCount(ops.visitors?.pending),
    "student-affairs":
      inProcess.reduce((sum, item) => sum + asCount(item?.count), 0) +
      asCount(ops.disciplinary?.underProcess) +
      asCount(ops.elections?.nominationsPending) +
      asCount(ops.awards?.submitted),
    staff:
      asCount(ops.leaves?.pending) +
      asCount(ops.coverage?.withoutWarden) +
      asCount(ops.coverage?.withoutSupervisor),
    dining: asCount(dining.rebates?.pending) + asCount(dining.billing?.duesCount),
  }
}

const useAdminCategoryCounts = (enabled) => {
  const query = useQuery({
    queryKey: queryKeys.adminDashboard.data(),
    queryFn: async () => {
      const response = await dashboardApi.getAdminDashboardData()
      return response?.data ?? response
    },
    enabled,
    staleTime: 60_000,
    refetchInterval: 120_000,
  })

  return deriveAdminCategoryCounts(query.data)
}

export default useAdminCategoryCounts
