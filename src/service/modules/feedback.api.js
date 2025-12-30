/**
 * Feedback API Module
 * Handles user feedback operations
 */

import apiClient from "../core/apiClient"

export const feedbackApi = {
  /**
   * Get all feedbacks
   */
  getFeedbacks: () => {
    return apiClient.get("/feedback/")
  },

  /**
   * Update feedback status
   * @param {string} feedbackId - Feedback ID
   * @param {string} status - New status
   */
  updateFeedbackStatus: (feedbackId, status) => {
    return apiClient.put(`/feedback/update-status/${feedbackId}`, { status })
  },

  /**
   * Reply to feedback
   * @param {string} feedbackId - Feedback ID
   * @param {string} reply - Reply text
   */
  replyToFeedback: (feedbackId, reply) => {
    return apiClient.post(`/feedback/reply/${feedbackId}`, { reply })
  },

  /**
   * Submit new feedback
   * @param {Object} feedback - Feedback data
   */
  submitFeedback: (feedback) => {
    return apiClient.post("/feedback/add", feedback)
  },

  /**
   * Update existing feedback
   * @param {string} feedbackId - Feedback ID
   * @param {Object} updatedFeedback - Updated feedback data
   */
  updateFeedback: (feedbackId, updatedFeedback) => {
    return apiClient.put(`/feedback/${feedbackId}`, updatedFeedback)
  },

  /**
   * Delete feedback
   * @param {string} feedbackId - Feedback ID
   */
  deleteFeedback: (feedbackId) => {
    return apiClient.delete(`/feedback/${feedbackId}`)
  },

  /**
   * Get student's feedbacks
   * @param {string} studentId - Student ID
   */
  getStudentFeedbacks: (studentId) => {
    return apiClient.get(`/feedback/student/${studentId}`)
  },
}

export default feedbackApi
