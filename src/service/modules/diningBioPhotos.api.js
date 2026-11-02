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
 * Face-scanner bio-photo requests (Admin + Dining Office). Approving uploads the
 * photo to the face scanner software (EasyWDMS), which sends it to every machine.
 * Contract: temp/dining-bio-photo-contract.md.
 */
export const diningBioPhotosApi = {
  /** `{ status, search, page, limit }` → { items, total, page, limit, counts, scanner: { configured } } */
  list: (params = {}) => {
    return apiClient.get("/dining-bio-photos", { params }).then(unwrapStandardResponse)
  },

  /** Upload to the scanner software → { request }; 502 with the scanner's message if it refuses. */
  approve: (requestId) => {
    return apiClient.post(`/dining-bio-photos/${requestId}/approve`).then(unwrapStandardResponse)
  },

  /** `comment` is required → { request } */
  reject: (requestId, comment) => {
    return apiClient.post(`/dining-bio-photos/${requestId}/reject`, { comment }).then(unwrapStandardResponse)
  },
}

export default diningBioPhotosApi
