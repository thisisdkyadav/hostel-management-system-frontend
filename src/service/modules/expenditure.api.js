import apiClient from "../core/apiClient"

/** Unwrap the backend's { success, message, data } envelope down to `data`. */
const unwrap = (response) =>
  response &&
  typeof response === "object" &&
  typeof response.success === "boolean" &&
  Object.prototype.hasOwnProperty.call(response, "data")
    ? response.data
    : response

const BASE = "/student-affairs/expenditure"

export const expenditureApi = {
  // ---- Occurrences ----
  list: (params = {}) => apiClient.get(BASE, { params }).then(unwrap),
  get: (id) => apiClient.get(`${BASE}/${id}`).then(unwrap),
  create: (data) => apiClient.post(BASE, data).then(unwrap),
  update: (id, data) => apiClient.patch(`${BASE}/${id}`, data).then(unwrap),
  remove: (id) => apiClient.delete(`${BASE}/${id}`).then(unwrap),

  // ---- Expenses ----
  addExpense: (id, data) => apiClient.post(`${BASE}/${id}/expenses`, data).then(unwrap),
  updateExpense: (id, expenseId, data) => apiClient.patch(`${BASE}/${id}/expenses/${expenseId}`, data).then(unwrap),
  removeExpense: (id, expenseId) => apiClient.delete(`${BASE}/${id}/expenses/${expenseId}`).then(unwrap),

  // ---- Bills (nested under an expense) ----
  addBill: (id, expenseId, data) => apiClient.post(`${BASE}/${id}/expenses/${expenseId}/bills`, data).then(unwrap),
  updateBill: (id, expenseId, billId, data) => apiClient.patch(`${BASE}/${id}/expenses/${expenseId}/bills/${billId}`, data).then(unwrap),
  removeBill: (id, expenseId, billId) => apiClient.delete(`${BASE}/${id}/expenses/${expenseId}/bills/${billId}`).then(unwrap),

  // ---- Payments ----
  addPayment: (id, data) => apiClient.post(`${BASE}/${id}/payments`, data).then(unwrap),
  updatePayment: (id, paymentId, data) => apiClient.patch(`${BASE}/${id}/payments/${paymentId}`, data).then(unwrap),
  removePayment: (id, paymentId) => apiClient.delete(`${BASE}/${id}/payments/${paymentId}`).then(unwrap),

  // ---- Occurrence-level documents ----
  addDocuments: (id, attachments) => apiClient.post(`${BASE}/${id}/documents`, { attachments }).then(unwrap),
  removeDocument: (id, documentId) => apiClient.delete(`${BASE}/${id}/documents/${documentId}`).then(unwrap),
}

export default expenditureApi
