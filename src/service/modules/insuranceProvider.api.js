/**
 * Insurance Provider API Module
 * Handles insurance provider management
 */

import apiClient from "../core/apiClient"

const ROUTE = "/admin"

export const insuranceProviderApi = {
  /**
   * Get all insurance providers
   */
  getInsuranceProviders: () => {
    return apiClient.get(`${ROUTE}/insurance-providers`)
  },

  /**
   * Create insurance provider
   * @param {Object} providerData - Provider data
   */
  createInsuranceProvider: (providerData) => {
    return apiClient.post(`${ROUTE}/insurance-providers`, providerData)
  },

  /**
   * Update insurance provider
   * @param {string} id - Provider ID
   * @param {Object} providerData - Updated provider data
   */
  updateInsuranceProvider: (id, providerData) => {
    return apiClient.put(`${ROUTE}/insurance-providers/${id}`, providerData)
  },

  /**
   * Delete insurance provider
   * @param {string} id - Provider ID
   */
  deleteInsuranceProvider: (id) => {
    return apiClient.delete(`${ROUTE}/insurance-providers/${id}`)
  },

  /**
   * Bulk update student insurance
   * @param {Object} data - Bulk update data
   */
  updateBulkStudentInsurance: (data) => {
    return apiClient.post(`${ROUTE}/insurance-providers/bulk-student-update`, data)
  },
}

export default insuranceProviderApi
