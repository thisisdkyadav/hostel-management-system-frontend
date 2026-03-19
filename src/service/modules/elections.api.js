import apiClient from "../core/apiClient"

const BASE_PATH = "/student-affairs/elections"

export const electionsApi = {
  listAdminElections: (params = {}) => apiClient.get(`${BASE_PATH}/admin/selector`, { params }),

  getElectionDetail: (id) => apiClient.get(`${BASE_PATH}/${id}`),

  getVotingLiveStats: (id) => apiClient.get(`${BASE_PATH}/${id}/voting-live`),

  createElection: (payload) => apiClient.post(BASE_PATH, payload),

  updateElection: (id, payload) => apiClient.put(`${BASE_PATH}/${id}`, payload),

  getStudentPortalState: () => apiClient.get(`${BASE_PATH}/student/portal-state`),

  getStudentCurrent: () => apiClient.get(`${BASE_PATH}/student/current`),

  lookupNominationSupporter: (electionId, postId, params) =>
    apiClient.get(`${BASE_PATH}/${electionId}/posts/${postId}/supporters/lookup`, { params }),

  upsertNomination: (electionId, postId, payload) =>
    apiClient.post(`${BASE_PATH}/${electionId}/posts/${postId}/nominations`, payload),

  withdrawNomination: (electionId, nominationId) =>
    apiClient.post(`${BASE_PATH}/${electionId}/nominations/${nominationId}/withdraw`, {}),

  reviewNomination: (electionId, nominationId, payload) =>
    apiClient.post(`${BASE_PATH}/${electionId}/nominations/${nominationId}/review`, payload),

  castVote: (electionId, postId, payload) =>
    apiClient.post(`${BASE_PATH}/${electionId}/posts/${postId}/vote`, payload),

  publishResults: (electionId, payload) =>
    apiClient.post(`${BASE_PATH}/${electionId}/results/publish`, payload),

  sendVotingEmails: (electionId) =>
    apiClient.post(`${BASE_PATH}/${electionId}/voting-emails/send`, {}),

  getSupporterConfirmation: (token) =>
    apiClient.get(`${BASE_PATH}/supporter-confirmation/${token}`),

  respondToSupporterConfirmation: (token, payload) =>
    apiClient.post(`${BASE_PATH}/supporter-confirmation/${token}/respond`, payload),

  getBallotByToken: (token) =>
    apiClient.get(`${BASE_PATH}/ballot/${token}`),

  submitBallotByToken: (token, payload) =>
    apiClient.post(`${BASE_PATH}/ballot/${token}/submit`, payload),
}

export default electionsApi
