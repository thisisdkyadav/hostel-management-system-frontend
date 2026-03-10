/**
 * DisCo (Disciplinary Committee) API Module
 * Handles manual disciplinary actions and admin-driven process workflow operations.
 */

import apiClient from "../core/apiClient"
import { ApiError, NetworkError } from "../core/errors"
import { baseUrl, fetchOptions } from "../../constants/appConstants"

const parseErrorResponse = async (response) => {
  try {
    const errorData = await response.json()
    if (typeof errorData?.message === "string" && errorData.message.trim()) {
      return errorData.message
    }

    if (typeof errorData?.error === "string" && errorData.error.trim()) {
      return errorData.error
    }

    return `Request failed with status ${response.status}`
  } catch {
    return `Request failed with status ${response.status}`
  }
}

const getFileNameFromDisposition = (contentDisposition = "", fallback = "disciplinary-case-export.zip") => {
  if (!contentDisposition) return fallback

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1])
    } catch {
      return utf8Match[1]
    }
  }

  const asciiMatch = contentDisposition.match(/filename="([^"]+)"/i) || contentDisposition.match(/filename=([^;]+)/i)
  if (asciiMatch?.[1]) {
    return asciiMatch[1].trim()
  }

  return fallback
}

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

  /**
   * Download finalized disciplinary process case bundle as zip
   * @param {string} caseId
   */
  downloadProcessCaseBundle: async (caseId) => {
    const url = `${baseUrl}/disco/process/cases/${caseId}/export`

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        method: "GET",
      })

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response)
        throw new ApiError(errorMessage, response.status, response)
      }

      const blob = await response.blob()
      const fileName = getFileNameFromDisposition(
        response.headers.get("content-disposition"),
        `disciplinary-case-${String(caseId || "").slice(-6) || "export"}.zip`
      )

      return { blob, fileName }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new NetworkError("Network error. Please check your connection.")
      }

      throw new ApiError(error.message || "Failed to download disciplinary case bundle")
    }
  },
}

export default discoApi
