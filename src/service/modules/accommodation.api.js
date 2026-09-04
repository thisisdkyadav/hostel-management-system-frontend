/**
 * Accommodation API Module
 * Visitor accommodation workflow (replaces the legacy visitor request flow).
 * All endpoints are on the Express backend under /accommodation.
 */

import apiClient from "../core/apiClient"
import { API_BACKENDS, getApiBaseUrl } from "@/config/apiConfig"

/**
 * Direct URL to the invoice PDF. It is a plain authenticated GET, so it drops
 * straight into a viewer or a download link — `attachment` makes the browser
 * save it instead of rendering it inline.
 */
export const invoiceFileUrl = (requestId, disposition = "inline") =>
  `${getApiBaseUrl(API_BACKENDS.NODE)}/accommodation/requests/${requestId}/invoice?disposition=${disposition}`

export const accommodationApi = {
  // ---- Shared / student ----
  getTypes: () => apiClient.get("/accommodation/types"),

  /** Live charge preview. body: { typeKey?, persons?|guests, stay:{ fromDate, toDate } } */
  previewQuote: (body) => apiClient.post("/accommodation/quote", body),

  /** List requests. params: { status?, queue?, mine?, page?, limit? } */
  listRequests: (params = {}) => apiClient.get("/accommodation/requests", { params }),

  getRequest: (requestId) => apiClient.get(`/accommodation/requests/${requestId}`),

  /** Absolute URL of the generated invoice PDF (view or download). */
  invoiceFileUrl,

  submitRequest: (body) => apiClient.post("/accommodation/requests", body),

  resubmitRequest: (requestId, body) => apiClient.post(`/accommodation/requests/${requestId}/resubmit`, body),

  cancelRequest: (requestId) => apiClient.post(`/accommodation/requests/${requestId}/cancel`),

  /** Student uploads payment proof. body: { screenshotFileRef, utr, paidAt } */
  submitPayment: (requestId, body) => apiClient.post(`/accommodation/requests/${requestId}/payment`, body),

  /** Student opts to pay later (rooms allocated only after payment). */
  deferPayment: (requestId) => apiClient.post(`/accommodation/requests/${requestId}/defer-payment`),

  /**
   * Student postpone / extend stay dates.
   * body: { type: "postpone"|"extend", fromDate?, toDate, reason }
   */
  requestScheduleChange: (requestId, body) =>
    apiClient.post(`/accommodation/requests/${requestId}/schedule-change`, body),

  /**
   * CWO decide postpone/extend. body: { action: "approve"|"reject", note?, extraAmount? }
   */
  decideScheduleChange: (requestId, changeId, body) =>
    apiClient.post(`/accommodation/requests/${requestId}/schedule-change/${changeId}/decision`, body),

  // ---- Chief Warden Office (capacity screening) ----
  /** body: { action: "approve" | "request_modification" | "reject", reason? } */
  capacityDecision: (requestId, body) =>
    apiClient.post(`/accommodation/requests/${requestId}/capacity-decision`, body),

  // ---- Chief Warden ----
  /** body: { action: "approve" | "request_modification" | "reject", reason? } */
  decision: (requestId, body) => apiClient.post(`/accommodation/requests/${requestId}/decision`, body),

  /** Chief Warden / CW Office skip the faculty-advisor stage. */
  bypassFacultyAdvisor: (requestId) => apiClient.post(`/accommodation/requests/${requestId}/bypass-fa`),

  // ---- Chief Warden Office ----
  /**
   * Sets per-guest price + GST, allots a hostel per visitor, and requests payment.
   * body: { guestAllotments: [{ guestIndex, hostelId }], remarks?, guestCharges: [...] }
   * Legacy: hostelId allots every guest to one hostel.
   */
  issuePaymentRequest: (requestId, body = {}) =>
    apiClient.post(`/accommodation/requests/${requestId}/payment-request`, body),

  /** Free guest beds per hostel + price/GST presets for the charge form. */
  getAllotmentAvailability: (requestId) =>
    apiClient.get(`/accommodation/requests/${requestId}/allotment-availability`),

  // ---- Accountant ----
  /** body: { action: "verify" | "reject", note?, utr?, paidAt? } — on a portal-submitted payment */
  verifyPayment: (requestId, body) => apiClient.post(`/accommodation/requests/${requestId}/payment-verify`, body),

  /** Correct UTR / payment date. body: { utr?, paidAt?, additionalPaymentId? } — at least one of utr/paidAt */
  updatePaymentDetails: (requestId, body) =>
    apiClient.post(`/accommodation/requests/${requestId}/payment-details`, body),

  /**
   * Records money that never went through the portal, or corrects a mistake.
   * body: { action: "mark_paid", method, reference?, paidAt?, note? }
   *     | { action: "mark_unpaid", note }
   */
  settlePayment: (requestId, body) => apiClient.post(`/accommodation/requests/${requestId}/payment-settle`, body),

  /** Chief Warden / CW Office cancel. body: { reason } */
  adminCancel: (requestId, body) => apiClient.post(`/accommodation/requests/${requestId}/admin-cancel`, body),

  // ---- Hostel Supervisor / Guest House Manager ----
  getRoomAvailability: (requestId) => apiClient.get(`/accommodation/requests/${requestId}/room-availability`),

  /** body: { rooms: [{ roomId, guestIndexes: number[] }] } */
  assignRooms: (requestId, body) => apiClient.post(`/accommodation/requests/${requestId}/assign-rooms`, body),

  // ---- Hostel Gate ----
  checkIn: (requestId) => apiClient.post(`/accommodation/requests/${requestId}/checkin`),
  checkOut: (requestId) => apiClient.post(`/accommodation/requests/${requestId}/checkout`),

  // ---- Public (faculty advisor token; no auth) ----
  getRecommendation: (token) => apiClient.get(`/accommodation/recommendation/${token}`),

  /** body: { decision: "recommend" | "decline", reason? } */
  submitRecommendation: (token, body) => apiClient.post(`/accommodation/recommendation/${token}`, body),
}

export default accommodationApi
