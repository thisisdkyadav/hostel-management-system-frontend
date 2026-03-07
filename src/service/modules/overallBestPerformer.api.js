import apiClient from "../core/apiClient"

const BASE_PATH = "/student-affairs/overall-best-performer"

export const overallBestPerformerApi = {
  getOccurrenceSelector: () => apiClient.get(`${BASE_PATH}/occurrences/selector`),

  getOccurrenceDetail: (id) => apiClient.get(`${BASE_PATH}/occurrences/${id}`),

  createOccurrence: (payload) => apiClient.post(`${BASE_PATH}/occurrences`, payload),

  updateOccurrence: (id, payload) => apiClient.put(`${BASE_PATH}/occurrences/${id}`, payload),

  getStudentPortalState: () => apiClient.get(`${BASE_PATH}/student/portal-state`),

  upsertApplication: (occurrenceId, payload) =>
    apiClient.post(`${BASE_PATH}/occurrences/${occurrenceId}/application`, payload),

  reviewApplication: (applicationId, payload) =>
    apiClient.post(`${BASE_PATH}/applications/${applicationId}/review`, payload),
}

export default overallBestPerformerApi
