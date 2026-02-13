/**
 * DisCo (Disciplinary Committee) API Module
 * Handles disciplinary action operations
 */

import apiClient from "../core/apiClient"

export const discoApi = {
  /**
   * Add DisCo action
   * @param {Object} data - DisCo action data
   */
  addDisCoAction: (data) => {
    return apiClient.post("/disco/add", data)
  },

  /**
   * Get DisCo actions by student
   * @param {string} studentId - Student ID
   */
  getDisCoActionsByStudent: (studentId) => {
    return apiClient.get(`/disco/${studentId}`)
  },

  /**
   * Update DisCo action
   * @param {string} disCoId - DisCo action ID
   * @param {Object} data - Updated data
   */
  updateDisCoAction: (disCoId, data) => {
    return apiClient.put(`/disco/update/${disCoId}`, data)
  },

  /**
   * Delete DisCo action
   * @param {string} disCoId - DisCo action ID
   */
  deleteDisCoAction: (disCoId) => {
    return apiClient.delete(`/disco/${disCoId}`)
  },

  /**
   * Submit disciplinary process case (student)
   * @param {Object} data - { complaintPdfUrl, complaintPdfName }
   */
  submitProcessCase: (data) => {
    return apiClient.post("/disco/process/cases", data)
  },

  /**
   * Get student process cases
   */
  getMyProcessCases: () => {
    return apiClient.get("/disco/process/my-cases")
  },

  /**
   * Get admin process cases list
   * @param {Object} params - filters/pagination
   */
  getProcessCases: (params = {}) => {
    return apiClient.get("/disco/process/cases", { params })
  },

  /**
   * Get process case by id
   * @param {string} caseId
   */
  getProcessCaseById: (caseId) => {
    return apiClient.get(`/disco/process/cases/${caseId}`)
  },

  /**
   * Initial review action
   * @param {string} caseId
   * @param {Object} data - { decision, description }
   */
  reviewProcessCase: (caseId, data) => {
    return apiClient.patch(`/disco/process/cases/${caseId}/review`, data)
  },

  /**
   * Add statement
   * @param {string} caseId
   * @param {Object} data
   */
  addCaseStatement: (caseId, data) => {
    return apiClient.post(`/disco/process/cases/${caseId}/statements`, data)
  },

  /**
   * Remove statement
   * @param {string} caseId
   * @param {string} statementId
   */
  removeCaseStatement: (caseId, statementId) => {
    return apiClient.delete(`/disco/process/cases/${caseId}/statements/${statementId}`)
  },

  /**
   * Send case email
   * @param {string} caseId
   * @param {Object} data
   */
  sendCaseEmail: (caseId, data) => {
    return apiClient.post(`/disco/process/cases/${caseId}/send-email`, data)
  },

  /**
   * Upload committee minutes metadata
   * @param {string} caseId
   * @param {Object} data - { pdfUrl, pdfName }
   */
  uploadCommitteeMinutes: (caseId, data) => {
    return apiClient.patch(`/disco/process/cases/${caseId}/committee-minutes`, data)
  },

  /**
   * Finalize case with rejection or disciplinary action
   * @param {string} caseId
   * @param {Object} data
   */
  finalizeProcessCase: (caseId, data) => {
    return apiClient.patch(`/disco/process/cases/${caseId}/finalize`, data)
  },
}

export default discoApi
