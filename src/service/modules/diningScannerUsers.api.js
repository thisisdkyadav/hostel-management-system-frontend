import apiClient from "../core/apiClient"
import { getApiBaseUrl } from "../../config/apiConfig"

const unwrap = (response) =>
  response && typeof response === "object" && typeof response.success === "boolean" && Object.prototype.hasOwnProperty.call(response, "data")
    ? response.data
    : response

/**
 * Scanner photos (Admin + Dining Office): each active student's face photo in
 * HMS and whether every face machine has it.
 */
export const diningScannerUsersApi = {
  /** `{ status, search, page, limit }` → { items, total, counts, machines, profileJob } */
  list: (params = {}) => apiClient.get("/dining-scanner-users", { params }).then(unwrap),

  /** Use the student's HMS profile photo as their scanner photo → { item, outcome } */
  useProfilePhoto: (rollNumber, { replace = false } = {}) =>
    apiClient.post(`/dining-scanner-users/${encodeURIComponent(rollNumber)}/profile-photo`, { replace }).then(unwrap),

  /** Background run: profile photos for every active student with no scanner photo → { total } */
  useProfilePhotos: () => apiClient.post("/dining-scanner-users/profile-photos").then(unwrap),

  /** The scanner photo (served by HMS with the staff session). */
  photoUrl: (rollNumber, version = "") =>
    `${getApiBaseUrl()}/dining-scanner-users/${encodeURIComponent(rollNumber)}/photo${version ? `?v=${encodeURIComponent(version)}` : ""}`,
}

export default diningScannerUsersApi
