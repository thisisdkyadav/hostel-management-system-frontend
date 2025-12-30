/**
 * Leave API Module
 * Handles leave requests, approvals, rejections
 */

import apiClient from "../core/apiClient"

export const leaveApi = {
  /**
   * Create leave request
   * @param {Object} leaveData - { reason, startDate, endDate }
   */
  createLeave: (leaveData) => {
    return apiClient.post("/leave", leaveData)
  },

  /**
   * Get current user's leaves
   */
  getMyLeaves: () => {
    return apiClient.get("/leave/my-leaves")
  },

  /**
   * Get all leaves with filters
   * @param {Object} queryParams - { userId, status, startDate, endDate, page, limit }
   */
  getLeaves: (queryParams = {}) => {
    const queryString = new URLSearchParams(queryParams).toString()
    return apiClient.get("/leave/all", { queryString })
  },

  /**
   * Approve leave request
   * @param {string} leaveId - Leave ID
   * @param {Object} leaveData - Approval info
   */
  approveLeave: (leaveId, leaveData) => {
    return apiClient.put(`/leave/${leaveId}/approve`, leaveData)
  },

  /**
   * Reject leave request
   * @param {string} leaveId - Leave ID
   * @param {Object} leaveData - { reasonForRejection }
   */
  rejectLeave: (leaveId, leaveData) => {
    return apiClient.put(`/leave/${leaveId}/reject`, leaveData)
  },

  /**
   * Join from leave
   * @param {string} leaveId - Leave ID
   * @param {Object} joinInfo - Join information
   */
  joinLeave: (leaveId, joinInfo) => {
    return apiClient.put(`/leave/${leaveId}/join`, joinInfo)
  },
}

export default leaveApi
