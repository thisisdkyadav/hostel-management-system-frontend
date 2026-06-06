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

export const catererApi = {
  getMealVerificationContext: () => {
    return apiClient.get("/dining-meal-verification/context").then(unwrapStandardResponse)
  },

  getMealVerificationFeed: (filters = {}) => {
    return apiClient.get("/dining-meal-verification/feed", { params: filters }).then(unwrapStandardResponse)
  },

  getCurrentMealStudents: () => {
    return apiClient.get("/dining-meal-verification/available-students").then(unwrapStandardResponse)
  },

  manualMealVerification: (payload) => {
    return apiClient.post("/dining-meal-verification/manual", payload).then(unwrapStandardResponse)
  },
}

export default catererApi
