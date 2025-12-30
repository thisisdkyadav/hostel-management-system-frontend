/**
 * Stats API Module
 * Handles various statistics endpoints
 */

import apiClient from "../core/apiClient"

export const statsApi = {
  /**
   * Get hostel statistics
   */
  getHostelStats: () => {
    return apiClient.get("/stats/hostel")
  },

  /**
   * Get security statistics
   */
  getSecurityStats: () => {
    return apiClient.get("/stats/security")
  },

  /**
   * Get maintenance staff statistics
   */
  getMaintenanceStaffStats: () => {
    return apiClient.get("/stats/maintenancestaff")
  },

  /**
   * Get visitor statistics
   * @param {string} hostelId - Hostel ID
   */
  getVisitorStats: (hostelId) => {
    return apiClient.get(`/stats/visitor/${hostelId}`)
  },

  /**
   * Get event statistics
   * @param {string} hostelId - Hostel ID
   */
  getEventStats: (hostelId) => {
    return apiClient.get(`/stats/event/${hostelId}`)
  },

  /**
   * Get lost and found statistics
   */
  getLostAndFoundStats: () => {
    return apiClient.get("/stats/lostandfound")
  },

  /**
   * Get room change requests statistics
   * @param {string} hostelId - Hostel ID
   */
  getRoomChangeRequestsStats: (hostelId) => {
    return apiClient.get(`/stats/room-change-requests/${hostelId}`)
  },

  /**
   * Get warden statistics
   */
  getWardenStats: () => {
    return apiClient.get("/stats/wardens")
  },

  /**
   * Get complaints statistics
   */
  getComplaintsStats: () => {
    return apiClient.get("/stats/complaints")
  },
}

export default statsApi
