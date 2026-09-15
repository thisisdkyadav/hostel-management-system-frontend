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

  /**
   * Attach one insurance PDF to the student named in the file.
   * Field name must be `document`. Filename format: `{id}_{rollNumber}.pdf`.
   *
   * Tries the admin route first (what production already calls), then the
   * /upload alias, so a mixed frontend/backend deploy still works.
   * @param {FormData} fileData
   */
  uploadStudentInsurancePdf: async (fileData) => {
    const paths = [
      `${ROUTE}/insurance-providers/student-document`,
      "/upload/insurance-pdf",
    ]
    let lastError = null
    for (const path of paths) {
      try {
        return await apiClient.upload(path, fileData)
      } catch (error) {
        lastError = error
        const missingRoute =
          error?.status === 404 || /route\s+.+\s+not found/i.test(String(error?.message || ""))
        if (!missingRoute) throw error
      }
    }
    throw lastError
  },
}

export default insuranceProviderApi
