/**
 * Live Check-In/Out API Module
 * Handles real-time check-in/out operations
 */

import apiClient from "../core/apiClient"

export const liveCheckInOutApi = {
  /**
   * Get live check-in/out entries with filters
   * @param {Object} filters - Query filters
   */
  getEntries: (filters = {}) => {
    return apiClient.get("/live-checkinout/entries", { params: filters })
  },

  /**
   * Get hostel-wise statistics
   */
  getHostelWiseStats: () => {
    return apiClient.get("/live-checkinout/stats/hostel-wise")
  },

  /**
   * Get recent activity
   * @param {number} limit - Number of recent activities to fetch
   */
  getRecentActivity: (limit = 50) => {
    return apiClient.get("/live-checkinout/recent", { params: { limit } })
  },

  /**
   * Get time-based analytics
   * @param {string} date - Optional date for analytics
   */
  getTimeBasedAnalytics: (date = null) => {
    const params = date ? { date } : {}
    return apiClient.get("/live-checkinout/analytics/time-based", { params })
  },
}

export default liveCheckInOutApi
