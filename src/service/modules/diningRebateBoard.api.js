import apiClient from "../core/apiClient"

const unwrap = (response) =>
  response && typeof response === "object" && typeof response.success === "boolean" && Object.prototype.hasOwnProperty.call(response, "data")
    ? response.data
    : response

const BASE = "/admin/dining-rebates/board"

/**
 * Rebate board (Admin + Dining Office): rebates by dining period, plus
 * office-side create / edit / archive / restore. `periodId` may be "outside"
 * (days no dining period covers); left out, the server picks the running period.
 */
export const diningRebateBoardApi = {
  /** { periodId } → { periods, scope, period, today, stats, daily } */
  overview: (params = {}) => apiClient.get(`${BASE}/overview`, { params }).then(unwrap),

  /** { periodId, status, type, search, day, sort, page, limit } → { items, total, page, limit, counts, period, scope } */
  list: (params = {}) => apiClient.get(`${BASE}/list`, { params }).then(unwrap),

  /** { search, periodId } → { items } students with photo, room, caterer in the period and live rebates */
  students: (params = {}) => apiClient.get(`${BASE}/students`, { params }).then(unwrap),

  /** { studentUserIds | rebateId, startDate, endDate, type } → { plan } */
  preview: (payload) => apiClient.post(`${BASE}/preview`, payload).then(unwrap),

  /** { studentUserIds, startDate, endDate, type, status, reason, adminComment, note } → { rebates } */
  create: (payload) => apiClient.post(BASE, payload).then(unwrap),

  /** → { rebate } */
  get: (id) => apiClient.get(`${BASE}/${id}`).then(unwrap),

  /** → { items } newest first */
  history: (id) => apiClient.get(`${BASE}/${id}/history`).then(unwrap),

  /** { startDate, endDate, type, status, reason, adminComment, note } → { rebate } */
  update: (id, payload) => apiClient.put(`${BASE}/${id}`, payload).then(unwrap),

  /** { reason } → { rebate } */
  archive: (id, payload = {}) => apiClient.put(`${BASE}/${id}/archive`, payload).then(unwrap),

  /** → { rebate } */
  restore: (id) => apiClient.put(`${BASE}/${id}/restore`, {}).then(unwrap),

  approve: (id) => apiClient.put(`/admin/dining-rebates/${id}/approve`, {}).then(unwrap),

  reject: (id, comment = "") => apiClient.put(`/admin/dining-rebates/${id}/reject`, { comment }).then(unwrap),
}

export default diningRebateBoardApi
