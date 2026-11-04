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
  /** `{ status, search, page, limit }` → { items, total, page, limit, counts, machines }. `status` is a photo status or a check summary. */
  list: (params = {}) => apiClient.get("/dining-scanner-users", { params }).then(unwrap),

  /** The overview → { total, withPhoto, status, checks, missingWithProfile, machines, profileJob } */
  stats: () => apiClient.get("/dining-scanner-users/stats").then(unwrap),

  /** One student → { item } */
  get: (rollNumber) => apiClient.get(`/dining-scanner-users/${encodeURIComponent(rollNumber)}`).then(unwrap),

  /** Use the student's HMS profile photo as their scanner photo → { item, outcome } */
  useProfilePhoto: (rollNumber, { replace = false } = {}) =>
    apiClient.post(`/dining-scanner-users/${encodeURIComponent(rollNumber)}/profile-photo`, { replace }).then(unwrap),

  /**
   * Background run: profile photos for every active student with no scanner photo;
   * with includeNotWorking, also for those whose photo a machine refused or made no face from → { total }
   */
  useProfilePhotos: ({ includeNotWorking = false } = {}) => apiClient.post("/dining-scanner-users/profile-photos", { includeNotWorking }).then(unwrap),

  /** Ask every synced machine for what it holds for this student → { item } */
  checkOnMachines: (rollNumber) => apiClient.post(`/dining-scanner-users/${encodeURIComponent(rollNumber)}/machine-check`).then(unwrap),

  /** The face photo a machine sent back (`machine` = serial number). */
  machinePhotoUrl: (rollNumber, machine, version = "") =>
    `${getApiBaseUrl()}/dining-scanner-users/${encodeURIComponent(rollNumber)}/machine-photo?machine=${encodeURIComponent(machine)}${version ? `&v=${encodeURIComponent(version)}` : ""}`,

  /** The scanner photo (served by HMS with the staff session). */
  photoUrl: (rollNumber, version = "") =>
    `${getApiBaseUrl()}/dining-scanner-users/${encodeURIComponent(rollNumber)}/photo${version ? `?v=${encodeURIComponent(version)}` : ""}`,
}

export default diningScannerUsersApi
