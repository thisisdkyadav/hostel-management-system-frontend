import apiClient from "../core/apiClient"

const BASE_PATH = "/student-affairs/elections"

export const electionsApi = {
  listAdminElections: (params = {}) => apiClient.get(`${BASE_PATH}/admin/selector`, { params }),

  getElectionDetail: (id) => apiClient.get(`${BASE_PATH}/${id}`),

  createElection: (payload) => apiClient.post(BASE_PATH, payload),

  updateElection: (id, payload) => apiClient.put(`${BASE_PATH}/${id}`, payload),

  getStudentPortalState: () => apiClient.get(`${BASE_PATH}/student/portal-state`),

  getStudentCurrent: () => apiClient.get(`${BASE_PATH}/student/current`),

  upsertNomination: (electionId, postId, payload) =>
    apiClient.post(`${BASE_PATH}/${electionId}/posts/${postId}/nominations`, payload),

  withdrawNomination: (electionId, nominationId) =>
    apiClient.post(`${BASE_PATH}/${electionId}/nominations/${nominationId}/withdraw`, {}),

  reviewNomination: (electionId, nominationId, payload) =>
    apiClient.post(`${BASE_PATH}/${electionId}/nominations/${nominationId}/review`, payload),

  castVote: (electionId, postId, payload) =>
    apiClient.post(`${BASE_PATH}/${electionId}/posts/${postId}/vote`, payload),
}

export default electionsApi
