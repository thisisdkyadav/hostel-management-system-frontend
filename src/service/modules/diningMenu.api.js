import apiClient from "../core/apiClient"

const unwrapStandardResponse = (response) => {
  if (
    response &&
    typeof response === "object" &&
    typeof response.success === "boolean" &&
    Object.prototype.hasOwnProperty.call(response, "data")
  ) {
    return response.data
  }

  return response
}

/**
 * The dining menu. Admin and the Dining Office manage it per kitchen (caterer): a weekly menu kept as
 * dated versions, plus per-date, per-meal overrides. Past days are a read-only record. A caterer login
 * only reads its own kitchen (`getCatererMenu`). Resolved day shape: see the dining-menu contract.
 */
export const diningMenuApi = {
  /** → { caterers: [{ id, name, isActive }] } */
  getCaterers: () => {
    return apiClient.get("/dining-menu/caterers").then(unwrapStandardResponse)
  },

  /** `{ catererId, from, to }` (≤ 62 days) → { caterer, today, days }. */
  getRange: (params = {}) => {
    return apiClient.get("/dining-menu", { params }).then(unwrapStandardResponse)
  },

  /** → { versions: [{ effectiveFrom, days, note, updatedAt, updatedBy, isCurrent, isScheduled }] } */
  getVersions: (catererId) => {
    return apiClient.get("/dining-menu/versions", { params: { catererId } }).then(unwrapStandardResponse)
  },

  /** Upsert a weekly version: `{ catererId, effectiveFrom, days, note }` → { version }. */
  saveWeek: (payload) => {
    return apiClient.put("/dining-menu/week", payload).then(unwrapStandardResponse)
  },

  /** Only scheduled (future) versions can be deleted. */
  deleteWeek: ({ catererId, effectiveFrom }) => {
    return apiClient.delete("/dining-menu/week", { params: { catererId, effectiveFrom } }).then(unwrapStandardResponse)
  },

  /** `{ catererId, dates, meals: [{ name, items, note }] }` → { days }. Replaces those meals on those dates. */
  saveDates: (payload) => {
    return apiClient.put("/dining-menu/dates", payload).then(unwrapStandardResponse)
  },

  /** `{ catererId, dates, mealNames? }`: back to the weekly menu (all meals when `mealNames` is omitted). */
  deleteDates: (payload) => {
    return apiClient.delete("/dining-menu/dates", { body: JSON.stringify(payload) }).then(unwrapStandardResponse)
  },

  /** `{ fromCatererId, toCatererIds, effectiveFrom }` → { copied }. */
  copy: (payload) => {
    return apiClient.post("/dining-menu/copy", payload).then(unwrapStandardResponse)
  },

  /** `{ q, limit }` → { items: [{ name, diet, uses }] } for autocomplete. */
  getItems: (params = {}) => {
    return apiClient.get("/dining-menu/items", { params }).then(unwrapStandardResponse)
  },

  /** The logged-in caterer's own kitchen: `{ from, to }` → { caterer, today, days }. */
  getCatererMenu: (params = {}) => {
    return apiClient.get("/dining-caterer/menu", { params }).then(unwrapStandardResponse)
  },
}

export default diningMenuApi
