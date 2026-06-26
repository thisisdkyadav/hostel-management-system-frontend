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

export const porApi = {
  getWorkspace: () => {
    return apiClient.get("/student-affairs/por/workspace").then(unwrapStandardResponse)
  },

  getStudentRequests: (userId) => {
    return apiClient.get(`/student-affairs/por/student/${userId}`).then(unwrapStandardResponse)
  },

  create: (data) => {
    return apiClient.post("/student-affairs/por", data).then(unwrapStandardResponse)
  },

  createCategory: (data) => {
    return apiClient.post("/student-affairs/por/categories", data).then(unwrapStandardResponse)
  },

  update: (requestId, data) => {
    return apiClient.put(`/student-affairs/por/${requestId}`, data).then(unwrapStandardResponse)
  },

  updateCategory: (categoryId, data) => {
    return apiClient.put(`/student-affairs/por/categories/${categoryId}`, data).then(unwrapStandardResponse)
  },

  approve: (requestId, payload = {}) => {
    return apiClient.post(`/student-affairs/por/${requestId}/approve`, payload).then(unwrapStandardResponse)
  },

  reject: (requestId, reason) => {
    return apiClient.post(`/student-affairs/por/${requestId}/reject`, { reason }).then(unwrapStandardResponse)
  },

  requestRevision: (requestId, comments) => {
    return apiClient.post(`/student-affairs/por/${requestId}/revision`, { comments }).then(unwrapStandardResponse)
  },

  getHistory: (requestId) => {
    return apiClient.get(`/student-affairs/por/${requestId}/history`).then(unwrapStandardResponse)
  },

  /** Resolved template + data + signatures (data URLs) for rendering a POR certificate. */
  getCertificateData: (requestId) => {
    return apiClient.get(`/student-affairs/por/${requestId}/certificate`).then(unwrapStandardResponse)
  },
}

export default porApi
