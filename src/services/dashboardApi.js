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

  getStudentCount: async () => {
    const route = "/dashboard/student-count"
    const response = await fetch(`${baseUrl}${route}`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch student count")
    }

    return response.json()
  },

  getWardenHostelStatistics: async () => {
    const route = "/dashboard/warden/hostel-statistics"
    const response = await fetch(`${baseUrl}${route}`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch warden hostel statistics")
    }

    return response.json()
  },
}
