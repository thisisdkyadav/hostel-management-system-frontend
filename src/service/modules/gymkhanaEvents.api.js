/**
 * Gymkhana Events API Module
 * Handles all events management operations for Gymkhana module
 */

import apiClient from "../core/apiClient"

const BASE_PATH = "/student-affairs/events"

export const gymkhanaEventsApi = {
  // ═══════════════════════════════════════════════════════════════════════════
  // CALENDAR OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Create new calendar (Admin only)
   */
  createCalendar: (data) => {
    return apiClient.post(`${BASE_PATH}/calendar`, data)
  },

  /**
   * Get all calendars
   */
  getCalendars: (params = {}) => {
    return apiClient.get(`${BASE_PATH}/calendar`, { params })
  },

  /**
   * Get calendar by ID
   */
  getCalendarById: (id) => {
    return apiClient.get(`${BASE_PATH}/calendar/${id}`)
  },

  /**
   * Get calendar by academic year
   */
  getCalendarByYear: (year) => {
    return apiClient.get(`${BASE_PATH}/calendar/year/${year}`)
  },

  /**
   * Get all academic years (for dropdown)
   */
  getAcademicYears: () => {
    return apiClient.get(`${BASE_PATH}/calendar/years`)
  },

  /**
   * Update calendar (GS only, if unlocked)
   */
  updateCalendar: (id, data) => {
    return apiClient.put(`${BASE_PATH}/calendar/${id}`, data)
  },

  /**
   * Submit calendar for approval (GS only)
   */
  submitCalendar: (id, allowOverlappingDates = false) => {
    return apiClient.post(`${BASE_PATH}/calendar/${id}/submit`, { allowOverlappingDates })
  },

  /**
   * Check overlap for a candidate event in a calendar
   */
  checkDateOverlap: (id, data) => {
    return apiClient.post(`${BASE_PATH}/calendar/${id}/check-overlap`, data)
  },

  /**
   * Approve calendar
   */
  approveCalendar: (id, comments = "", nextApprovalStages = []) => {
    const payload = { comments }
    if (Array.isArray(nextApprovalStages) && nextApprovalStages.length > 0) {
      payload.nextApprovalStages = nextApprovalStages
    }
    return apiClient.post(`${BASE_PATH}/calendar/${id}/approve`, payload)
  },

  /**
   * Reject calendar
   */
  rejectCalendar: (id, reason) => {
    return apiClient.post(`${BASE_PATH}/calendar/${id}/reject`, { reason })
  },

  /**
   * Lock calendar (Admin only)
   */
  lockCalendar: (id) => {
    return apiClient.post(`${BASE_PATH}/calendar/${id}/lock`, {})
  },

  /**
   * Unlock calendar (Admin only)
   */
  unlockCalendar: (id) => {
    return apiClient.post(`${BASE_PATH}/calendar/${id}/unlock`, {})
  },

  /**
   * Get calendar approval history
   */
  getCalendarHistory: (id) => {
    return apiClient.get(`${BASE_PATH}/calendar/${id}/history`)
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EVENT OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get all events
   */
  getEvents: (params = {}) => {
    return apiClient.get(`${BASE_PATH}`, { params })
  },

  /**
   * Get event by ID
   */
  getEventById: (id) => {
    return apiClient.get(`${BASE_PATH}/${id}`)
  },

  /**
   * Get calendar view (for calendar display)
   */
  getCalendarView: (params = {}) => {
    return apiClient.get(`${BASE_PATH}/calendar-view`, { params })
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PROPOSAL OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get events needing proposals (GS dashboard)
   */
  getPendingProposals: (daysUntilDue = 21) => {
    return apiClient.get(`${BASE_PATH}/pending-proposals`, { params: { daysUntilDue } })
  },

  /**
   * Get proposals pending my approval
   */
  getProposalsForApproval: () => {
    return apiClient.get(`${BASE_PATH}/proposals/pending`)
  },

  /**
   * Submit proposal for event (GS only)
   */
  createProposal: (eventId, data) => {
    return apiClient.post(`${BASE_PATH}/events/${eventId}/proposal`, data)
  },

  /**
   * Get proposal for event
   */
  getProposalByEvent: (eventId) => {
    return apiClient.get(`${BASE_PATH}/events/${eventId}/proposal`)
  },

  /**
   * Get proposal by ID
   */
  getProposalById: (id) => {
    return apiClient.get(`${BASE_PATH}/proposals/${id}`)
  },

  /**
   * Update proposal (after revision request)
   */
  updateProposal: (id, data) => {
    return apiClient.put(`${BASE_PATH}/proposals/${id}`, data)
  },

  /**
   * Approve proposal
   */
  approveProposal: (id, comments = "", nextApprovalStages = []) => {
    const payload = { comments }
    if (Array.isArray(nextApprovalStages) && nextApprovalStages.length > 0) {
      payload.nextApprovalStages = nextApprovalStages
    }
    return apiClient.post(`${BASE_PATH}/proposals/${id}/approve`, payload)
  },

  /**
   * Reject proposal
   */
  rejectProposal: (id, reason) => {
    return apiClient.post(`${BASE_PATH}/proposals/${id}/reject`, { reason })
  },

  /**
   * Request proposal revision
   */
  requestRevision: (id, comments) => {
    return apiClient.post(`${BASE_PATH}/proposals/${id}/revision`, { comments })
  },

  /**
   * Get proposal approval history
   */
  getProposalHistory: (id) => {
    return apiClient.get(`${BASE_PATH}/proposals/${id}/history`)
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPENSE OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get all expenses (admin view)
   */
  getAllExpenses: (params = {}) => {
    return apiClient.get(`${BASE_PATH}/expenses`, { params })
  },

  /**
   * Submit expense for event (GS only)
   */
  submitExpense: (eventId, data) => {
    return apiClient.post(`${BASE_PATH}/events/${eventId}/expenses`, data)
  },

  /**
   * Get expense for event
   */
  getExpenseByEvent: (eventId) => {
    return apiClient.get(`${BASE_PATH}/events/${eventId}/expenses`)
  },

  /**
   * Update expense (GS only)
   */
  updateExpense: (id, data) => {
    return apiClient.put(`${BASE_PATH}/expenses/${id}`, data)
  },

  /**
   * Approve expense (Admin only)
   */
  approveExpense: (id, comments = "", nextApprovalStages = []) => {
    const payload = { comments }
    if (Array.isArray(nextApprovalStages) && nextApprovalStages.length > 0) {
      payload.nextApprovalStages = nextApprovalStages
    }
    return apiClient.post(`${BASE_PATH}/expenses/${id}/approve`, payload)
  },

  /**
   * Reject expense (Admin approval stage)
   */
  rejectExpense: (id, reason) => {
    return apiClient.post(`${BASE_PATH}/expenses/${id}/reject`, { reason })
  },

  /**
   * Get expense approval history
   */
  getExpenseHistory: (id) => {
    return apiClient.get(`${BASE_PATH}/expenses/${id}/history`)
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AMENDMENT OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Request amendment (GS only, when calendar is locked)
   */
  createAmendment: (data) => {
    return apiClient.post(`${BASE_PATH}/amendments`, data)
  },

  /**
   * Get pending amendments (Admin only)
   */
  getPendingAmendments: () => {
    return apiClient.get(`${BASE_PATH}/amendments`)
  },

  /**
   * Approve amendment (Admin only)
   */
  approveAmendment: (id, comments = "") => {
    return apiClient.post(`${BASE_PATH}/amendments/${id}/approve`, { reviewComments: comments })
  },

  /**
   * Reject amendment (Admin only)
   */
  rejectAmendment: (id, comments) => {
    return apiClient.post(`${BASE_PATH}/amendments/${id}/reject`, { reviewComments: comments })
  },
}

export default gymkhanaEventsApi
