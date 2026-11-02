import apiClient from "../core/apiClient"
import { getApiBaseUrl } from "../../config/apiConfig"

const unwrap = (response) =>
  response && typeof response === "object" && typeof response.success === "boolean" && Object.prototype.hasOwnProperty.call(response, "data")
    ? response.data
    : response

/**
 * Face-scanner users (Admin + Dining Office): HMS's copy of everyone on the
 * mess face scanners (EasyWDMS) and whether their scanner photo works.
 */
export const diningScannerUsersApi = {
  /** `{ status, search, page, limit }` → { items, total, counts, sync, profileJob, scanner } */
  list: (params = {}) => apiClient.get("/dining-scanner-users", { params }).then(unwrap),

  /** Add an HMS student to the scanners → { item, alreadyOnScanner } */
  add: (rollNumber) => apiClient.post("/dining-scanner-users", { rollNumber }).then(unwrap),

  /** Refresh everyone from the scanner software in the background (202). */
  sync: () => apiClient.post("/dining-scanner-users/sync").then(unwrap),

  /** Send the HMS profile photo and wait for the machines → { item, outcome } */
  useProfilePhoto: (rollNumber, { replace = false } = {}) =>
    apiClient.post(`/dining-scanner-users/${encodeURIComponent(rollNumber)}/profile-photo`, { replace }).then(unwrap),

  /** Background run: profile photos for everyone in HMS with no scanner photo → { total } */
  useProfilePhotos: () => apiClient.post("/dining-scanner-users/profile-photos").then(unwrap),

  /** The scanner photo (served by HMS with the staff session). */
  photoUrl: (rollNumber, version = "") =>
    `${getApiBaseUrl()}/dining-scanner-users/${encodeURIComponent(rollNumber)}/photo${version ? `?v=${encodeURIComponent(version)}` : ""}`,
}

export default diningScannerUsersApi
