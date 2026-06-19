/**
 * Accommodation API Module
 * Visitor accommodation workflow (replaces the legacy visitor request flow).
 * All endpoints are on the Express backend under /accommodation.
 */

import apiClient from "../core/apiClient"

export const accommodationApi = {
  // ---- Shared / student ----
  getTypes: () => apiClient.get("/accommodation/types"),

  /** Live charge preview. body: { typeKey?, persons?|guests, stay:{ fromDate, toDate } } */
  previewQuote: (body) => apiClient.post("/accommodation/quote", body),

  /** List requests. params: { status?, queue?, mine?, page?, limit? } */
  listRequests: (params = {}) => apiClient.get("/accommodation/requests", { params }),

  getRequest: (requestId) => apiClient.get(`/accommodation/requests/${requestId}`),

  submitRequest: (body) => apiClient.post("/accommodation/requests", body),

  resubmitRequest: (requestId, body) => apiClient.post(`/accommodation/requests/${requestId}/resubmit`, body),

  cancelRequest: (requestId) => apiClient.post(`/accommodation/requests/${requestId}/cancel`),

  /** Student uploads payment proof. body: { screenshotFileRef, transactionId } */
  submitPayment: (requestId, body) => apiClient.post(`/accommodation/requests/${requestId}/payment`, body),

  // ---- Chief Warden ----
  /** body: { action: "approve" | "request_modification" | "reject", reason? } */
  decision: (requestId, body) => apiClient.post(`/accommodation/requests/${requestId}/decision`, body),

  // ---- Chief Warden Office ----
  /** body: { amount?, paymentLink?, qrRef? } */
  issuePaymentRequest: (requestId, body = {}) =>
    apiClient.post(`/accommodation/requests/${requestId}/payment-request`, body),

  getAllotmentAvailability: (requestId) =>
    apiClient.get(`/accommodation/requests/${requestId}/allotment-availability`),

  /** body: { hostelId } */
  allotHostel: (requestId, body) => apiClient.post(`/accommodation/requests/${requestId}/allot`, body),

  // ---- Accountant ----
  /** body: { action: "verify" | "reject", note? } */
  verifyPayment: (requestId, body) => apiClient.post(`/accommodation/requests/${requestId}/payment-verify`, body),

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
