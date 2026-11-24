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
}
