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

const BASE_PATH = "/student-affairs/attendance"

export const attendanceApi = {
  /** List occurrences visible to the current user (managers see all, others see assigned). */
  list: (params = {}) => {
    return apiClient.get(BASE_PATH, { params }).then(unwrapStandardResponse)
  },

  /** Get a single occurrence with its records + roster reconciliation. */
  get: (occurrenceId) => {
    return apiClient.get(`${BASE_PATH}/${occurrenceId}`).then(unwrapStandardResponse)
  },

  create: (data) => {
    return apiClient.post(BASE_PATH, data).then(unwrapStandardResponse)
  },

  update: (occurrenceId, data) => {
    return apiClient.patch(`${BASE_PATH}/${occurrenceId}`, data).then(unwrapStandardResponse)
  },

  remove: (occurrenceId) => {
    return apiClient.delete(`${BASE_PATH}/${occurrenceId}`).then(unwrapStandardResponse)
  },

  /** Replace the expected roster (array of roll numbers) for absent/extra reconciliation. */
  uploadRoster: (occurrenceId, rollNumbers) => {
    return apiClient
      .post(`${BASE_PATH}/${occurrenceId}/roster`, { rollNumbers })
      .then(unwrapStandardResponse)
  },

  /** Mark present by scanning a student QR payload `{ email, encryptedData, source }`. */
  scan: (occurrenceId, payload) => {
    return apiClient.post(`${BASE_PATH}/${occurrenceId}/scan`, payload).then(unwrapStandardResponse)
  },

  /** Mark present manually by roll number. */
  mark: (occurrenceId, payload) => {
    return apiClient.post(`${BASE_PATH}/${occurrenceId}/mark`, payload).then(unwrapStandardResponse)
  },

  deleteRecord: (occurrenceId, recordId) => {
    return apiClient
      .delete(`${BASE_PATH}/${occurrenceId}/records/${recordId}`)
      .then(unwrapStandardResponse)
  },
}

export default attendanceApi
