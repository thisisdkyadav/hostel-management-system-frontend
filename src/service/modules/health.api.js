/**
 * Health API Module
 * Handles student health information and insurance claims
 */

import apiClient from "../core/apiClient"

const ROUTE = "/admin"

export const healthApi = {
  /**
   * Get student health information
   * @param {string} userId - User ID
   */
  getStudentHealth: (userId) => {
    return apiClient.get(`${ROUTE}/student/health/${userId}`)
  },

  /**
   * Update student health information
   * @param {string} userId - User ID
   * @param {Object} healthData - Health data
   */
  updateStudentHealth: (userId, healthData) => {
    return apiClient.put(`${ROUTE}/student/health/${userId}`, healthData)
  },

  /**
   * Bulk update student health
   * @param {Object} healthData - Bulk health data
   */
  updateBulkStudentHealth: (healthData) => {
    return apiClient.post(`${ROUTE}/student/health/bulk-update`, healthData)
  },

  // ==================== Insurance Claims ====================

  /**
   * Get insurance claims for a student
   * @param {string} userId - User ID
   */
  getInsuranceClaims: (userId) => {
    return apiClient.get(`${ROUTE}/insurance-claims/${userId}`)
  },

  /**
   * Create insurance claim
   * @param {Object} claimData - Claim data
   */
  createInsuranceClaim: (claimData) => {
    return apiClient.post(`${ROUTE}/insurance-claims`, claimData)
  },

  /**
   * Update insurance claim
   * @param {string} claimId - Claim ID
   * @param {Object} claimData - Updated claim data
   */
  updateInsuranceClaim: (claimId, claimData) => {
    return apiClient.put(`${ROUTE}/insurance-claims/${claimId}`, claimData)
  },

  /**
   * Delete insurance claim
   * @param {string} claimId - Claim ID
   */
  deleteInsuranceClaim: (claimId) => {
    return apiClient.delete(`${ROUTE}/insurance-claims/${claimId}`)
  },

  /**
   * Get all insurance providers
   */
  getInsuranceProviders: () => {
    return apiClient.get(`${ROUTE}/insurance-providers`)
  },
}

export default healthApi
