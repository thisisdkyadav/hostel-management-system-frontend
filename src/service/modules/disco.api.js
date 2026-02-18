/**
 * DisCo (Disciplinary Committee) API Module
 * Handles manual disciplinary actions and admin-driven process workflow operations.
 */

import apiClient from "../core/apiClient"

export const discoApi = {
  /**
   * Add manual DisCo action
   * @param {Object} data
   */
  addDisCoAction: (data) => {
    return apiClient.post("/disco/add", data)
  },

  /**
   * Get manual DisCo actions by student
   * @param {string} studentId
   */
  getDisCoActionsByStudent: (studentId) => {
    return apiClient.get(`/disco/${studentId}`)
  },

  /**
   * Update manual DisCo action
   * @param {string} disCoId
   * @param {Object} data
   */
  updateDisCoAction: (disCoId, data) => {
    return apiClient.put(`/disco/update/${disCoId}`, data)
  },

  /**
   * Mark reminder item completed for a DisCo action
   * @param {string} disCoId
   * @param {string} reminderItemId
   */
  markDisCoReminderDone: (disCoId, reminderItemId) => {
    return apiClient.patch(`/disco/update/${disCoId}/reminders/${reminderItemId}/done`)
  },

  /**
   * Delete manual DisCo action
   * @param {string} disCoId
   */
  deleteDisCoAction: (disCoId) => {
    return apiClient.delete(`/disco/${disCoId}`)
  },

  /**
   * Create disciplinary process case (admin)
   * @param {Object} data - { complaintPdfUrl, complaintPdfName }
   */
  createProcessCase: (data) => {
    return apiClient.post("/disco/process/cases", data)
  },

  /**
   * Backward-compatible alias
   * @param {Object} data - { complaintPdfUrl, complaintPdfName }
   */
  submitProcessCase: (data) => {
    return apiClient.post("/disco/process/cases", data)
  },

  /**
   * Get admin process cases list
   * @param {Object} params
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
   * Save stage 2 collection data
   * @param {string} caseId
   * @param {Object} data
   */
  saveCaseStageTwo: (caseId, data) => {
    return apiClient.patch(`/disco/process/cases/${caseId}/stage2`, data)
  },

  /**
   * Backward-compatible alias for old stage-2 statement API
   * @param {string} caseId
   * @param {Object} data
   */
  addCaseStatement: (caseId, data) => {
    return apiClient.patch(`/disco/process/cases/${caseId}/stage2`, data)
  },

  /**
   * Send committee email
   * @param {string} caseId
   * @param {Object} data
   */
  sendCaseEmail: (caseId, data) => {
    return apiClient.post(`/disco/process/cases/${caseId}/send-email`, data)
  },

  /**
   * Upload committee minutes metadata
   * @param {string} caseId
   * @param {Object} data
   */
  uploadCommitteeMinutes: (caseId, data) => {
    return apiClient.patch(`/disco/process/cases/${caseId}/committee-minutes`, data)
  },

  /**
   * Finalize process case
   * @param {string} caseId
   * @param {Object} data
   */
  finalizeProcessCase: (caseId, data) => {
    return apiClient.patch(`/disco/process/cases/${caseId}/finalize`, data)
  },
}

export default discoApi
