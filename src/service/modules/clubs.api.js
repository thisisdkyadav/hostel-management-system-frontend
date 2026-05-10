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

export const clubApi = {
  getMine: () => {
    return apiClient.get("/student-affairs/clubs/me").then(unwrapStandardResponse)
  },

  list: () => {
    return apiClient.get("/student-affairs/clubs").then(unwrapStandardResponse)
  },

  create: (data) => {
    return apiClient.post("/student-affairs/clubs", data).then(unwrapStandardResponse)
  },

  update: (clubId, data) => {
    return apiClient.put(`/student-affairs/clubs/${clubId}`, data).then(unwrapStandardResponse)
  },
}

export default clubApi
