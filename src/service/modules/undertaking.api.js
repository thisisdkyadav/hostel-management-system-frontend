/**
 * Undertaking API Module
 * Handles student undertaking operations
 */

import apiClient from "../core/apiClient"

export const undertakingApi = {
  /**
   * Get pending undertakings for student
   */
  getPendingUndertakings: () => {
    return apiClient.get("/undertaking/student/undertakings/pending")
  },

  /**
   * Get accepted undertakings for student
   */
  getAcceptedUndertakings: () => {
    return apiClient.get("/undertaking/student/undertakings/accepted")
  },

  /**
   * Get undertaking details
   * @param {string} undertakingId - Undertaking ID
   */
  getUndertakingDetails: (undertakingId) => {
    return apiClient.get(`/undertaking/student/undertakings/${undertakingId}`)
  },

  /**
   * Accept undertaking
   * @param {string} undertakingId - Undertaking ID
   */
  acceptUndertaking: (undertakingId) => {
    return apiClient.post(`/undertaking/student/undertakings/${undertakingId}/accept`, { accepted: true })
  },

  /**
   * Get pending undertakings count
   */
  pendingUndertakingsCount: () => {
    return apiClient.get("/undertaking/student/undertakings/pending/count")
  },
}

export default undertakingApi
