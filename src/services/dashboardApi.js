import { baseUrl, fetchOptions } from "../constants/appConstants"

export const dashboardApi = {
  getAdminDashboardData: async () => {
    const route = "/dashboard"
    const response = await fetch(`${baseUrl}${route}`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch dashboard data")
    }

    return response.json()
  },

  getStudentStatistics: async () => {
    const route = "/dashboard/student-statistics"
    const response = await fetch(`${baseUrl}${route}`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch student statistics")
    }

    return response.json()
  },
}
