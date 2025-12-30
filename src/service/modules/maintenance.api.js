/**
 * Maintenance API Module
 * Handles maintenance complaints and statistics
 */

import apiClient from "../core/apiClient"

export const maintenanceApi = {
  /**
   * Get complaints with query
   * @param {string} queries - Query string
   */
  getComplaints: (queries = "") => {
    return apiClient.get("/complaint/all", { queryString: queries })
  },

  /**
   * Update complaint status
   * @param {string} id - Complaint ID
   * @param {string} status - New status
   */
  updateComplaintStatus: (id, status) => {
    return apiClient.put(`/complaint/update-status/${id}`, { status })
  },

  /**
   * Get maintenance statistics
   */
  getStats: async () => {
    try {
      return await apiClient.get("/complaint/stats")
    } catch (error) {
      console.error("Error fetching maintenance stats:", error)
      // Return fallback stats in case of failure
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
      }
    }
  },
}

export default maintenanceApi
