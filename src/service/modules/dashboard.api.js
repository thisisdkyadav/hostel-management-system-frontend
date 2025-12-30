/**
 * Dashboard API Module
 * Handles dashboard data endpoints
 */

import apiClient from "../core/apiClient"

export const dashboardApi = {
  /**
   * Get admin dashboard data
   */
  getAdminDashboardData: () => {
    return apiClient.get("/dashboard")
  },

  /**
   * Get student statistics
   */
  getStudentStatistics: () => {
    return apiClient.get("/dashboard/student-statistics")
  },

  /**
   * Get student count
   */
  getStudentCount: () => {
    return apiClient.get("/dashboard/student-count")
  },

  /**
   * Get warden hostel statistics
   */
  getWardenHostelStatistics: () => {
    return apiClient.get("/dashboard/warden/hostel-statistics")
  },
}

export default dashboardApi
