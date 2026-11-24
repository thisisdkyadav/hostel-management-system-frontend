import apiClient from "../core/apiClient"

const unwrap = (response) =>
  response && typeof response === "object" && typeof response.success === "boolean" && Object.prototype.hasOwnProperty.call(response, "data")
    ? response.data
    : response

/** Students' devices and the installed SMS app. */
export const appUsageApi = {
  /** Student: report this visit `{ deviceId, platform, browser, mode, layout, installedHint }`. */
  ping: (body) => apiClient.post("/app-usage/ping", body).then(unwrap),

  /** Admin: { activeStudents, activeDays, installed, seen, withoutApp, trend, recent, generatedAt } */
  stats: () => apiClient.get("/app-usage/stats").then(unwrap),

  /** Any user: the page just opened `{ path, platform, mode }`. */
  visit: (body) => apiClient.post("/app-usage/visit", body).then(unwrap),

  /** Admin: { days, roles: [{ role, users, tracked, visits, activeUsers, recentVisits }] } */
  roles: () => apiClient.get("/app-usage/roles").then(unwrap),

  /** Admin: `{ role, search, page }` → { items: [{ userId, name, email, visits, pages, recentVisits, lastAt }], total, page, limit } */
  users: (params) => apiClient.get("/app-usage/users", { params }).then(unwrap),

  /** Admin: one user → { user, totalVisits, lastAt, pages: [...], days: [{ day, visits: [...] }] } */
  userActivity: (userId) => apiClient.get(`/app-usage/users/${encodeURIComponent(userId)}`).then(unwrap),
}
