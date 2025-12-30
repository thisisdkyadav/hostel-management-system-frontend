/**
 * Visitor API Module
 * Handles visitor profiles, requests, approvals, check-in/out
 */

import apiClient from "../core/apiClient"

export const visitorApi = {
  /**
   * Submit visitor request
   * @param {Object} visitorData - Visitor request data
   */
  submitVisitorRequest: (visitorData) => {
    return apiClient.post("/visitor/submit", visitorData)
  },

  /**
   * Get visitor requests summary
   */
  getVisitorRequestsSummary: () => {
    return apiClient.get("/visitor/requests/summary")
  },

  /**
   * Get all visitor requests
   */
  getVisitorRequests: () => {
    return apiClient.get("/visitor/requests")
  },

  /**
   * Get visitor request by ID
   * @param {string} requestId - Request ID
   */
  getVisitorRequestById: (requestId) => {
    return apiClient.get(`/visitor/requests/${requestId}`)
  },

  /**
   * Get visitor profiles
   */
  getVisitorProfiles: () => {
    return apiClient.get("/visitor/profiles")
  },

  /**
   * Add visitor profile
   * @param {Object} profileData - Visitor profile data
   */
  addVisitorProfile: (profileData) => {
    return apiClient.post("/visitor/profiles", profileData)
  },

  /**
   * Add visitor request
   * @param {Object} requestData - Visitor request data
   */
  addVisitorRequest: (requestData) => {
    return apiClient.post("/visitor/requests", requestData)
  },

  /**
   * Update visitor request
   * @param {string} requestId - Request ID
   * @param {Object} requestData - Updated request data
   */
  updateVisitorRequest: (requestId, requestData) => {
    return apiClient.put(`/visitor/requests/${requestId}`, requestData)
  },

  /**
   * Cancel visitor request
   * @param {string} requestId - Request ID
   */
  cancelVisitorRequest: (requestId) => {
    return apiClient.delete(`/visitor/requests/${requestId}`)
  },

  /**
   * Update visitor profile
   * @param {string} profileId - Profile ID
   * @param {Object} profileData - Updated profile data
   */
  updateVisitorProfile: (profileId, profileData) => {
    return apiClient.put(`/visitor/profiles/${profileId}`, profileData)
  },

  /**
   * Delete visitor profile
   * @param {string} profileId - Profile ID
   */
  deleteVisitorProfile: (profileId) => {
    return apiClient.delete(`/visitor/profiles/${profileId}`)
  },

  /**
   * Approve visitor request
   * @param {string} requestId - Request ID
   * @param {string} hostelId - Hostel ID
   * @param {number} amount - Amount
   * @param {Object} approvalInformation - Approval details
   */
  approveVisitorRequest: (requestId, hostelId, amount, approvalInformation) => {
    return apiClient.post(`/visitor/requests/${requestId}/approve`, {
      hostelId,
      amount,
      approvalInformation,
    })
  },

  /**
   * Reject visitor request
   * @param {string} requestId - Request ID
   * @param {string} reason - Rejection reason
   */
  rejectVisitorRequest: (requestId, reason) => {
    return apiClient.post(`/visitor/requests/${requestId}/reject`, { reason })
  },

  /**
   * Allocate rooms to visitor
   * @param {string} requestId - Request ID
   * @param {Object} allocationData - Room allocation data
   */
  allocateRooms: (requestId, allocationData) => {
    return apiClient.post(`/visitor/requests/${requestId}/allocate`, { allocationData })
  },

  /**
   * Check-in visitor
   * @param {string} requestId - Request ID
   * @param {Object} checkInData - Check-in data
   */
  checkInVisitor: (requestId, checkInData) => {
    return apiClient.post(`/visitor/requests/${requestId}/checkin`, checkInData)
  },

  /**
   * Check-out visitor
   * @param {string} requestId - Request ID
   * @param {Object} checkOutData - Check-out data
   */
  checkOutVisitor: (requestId, checkOutData) => {
    return apiClient.post(`/visitor/requests/${requestId}/checkout`, checkOutData)
  },

  /**
   * Update check times
   * @param {string} requestId - Request ID
   * @param {Object} checkData - Check time data
   */
  updateCheckTimes: (requestId, checkData) => {
    return apiClient.put(`/visitor/requests/${requestId}/update-check-times`, checkData)
  },

  /**
   * Get student's visitor requests
   * @param {string} studentId - Student ID
   */
  getStudentVisitorRequests: (studentId) => {
    return apiClient.get(`/visitor/requests/student/${studentId}`)
  },

  /**
   * Submit payment info
   * @param {string} requestId - Request ID
   * @param {Object} paymentData - Payment data
   */
  submitPaymentInfo: (requestId, paymentData) => {
    return apiClient.put(`/visitor/requests/${requestId}/payment-info`, paymentData)
  },
}

export default visitorApi
