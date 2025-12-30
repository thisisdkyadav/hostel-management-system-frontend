/**
 * Complaint API Module
 * Handles complaint creation, status updates, feedback
 */

import apiClient from "../core/apiClient"

export const complaintApi = {
  /**
   * Create new complaint
   * @param {Object} complaintData - Complaint data
   */
  createComplaint: (complaintData) => {
    return apiClient.post("/complaint", complaintData)
  },

  /**
   * Update complaint status
   * @param {string} complaintId - Complaint ID
   * @param {string} status - New status
   */
  updateStatus: (complaintId, status) => {
    return apiClient.put(`/complaint/${complaintId}/status`, { status })
  },

  /**
   * Update complaint resolution notes
   * @param {string} complaintId - Complaint ID
   * @param {string} resolutionNotes - Resolution notes
   */
  updateComplaintResolutionNotes: (complaintId, resolutionNotes) => {
    return apiClient.put(`/complaint/${complaintId}/resolution-notes`, { resolutionNotes })
  },

  /**
   * Get complaint statistics
   * @param {Object} query - Query parameters
   */
  getStats: (query = {}) => {
    const queryString = new URLSearchParams(query).toString()
    return apiClient.get("/complaint/stats", { queryString })
  },

  /**
   * Submit feedback for complaint
   * @param {string} complaintId - Complaint ID
   * @param {Object} feedbackData - Feedback data
   */
  giveFeedback: (complaintId, feedbackData) => {
    return apiClient.post(`/complaint/${complaintId}/feedback`, feedbackData)
  },
}

export default complaintApi
